import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/actionTypes';
import {
	CreateHub,
	ReadHub,
	UpdateHubSettings,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubActions';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import type {Directory} from '$lib/vocab/entity/entityData';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {checkActorName, scrubActorName} from '$lib/vocab/actor/actorHelpers';
import {isPersonaAdmin, isPersonaNameReserved} from '$lib/vocab/actor/actorHelpers.server';
import {
	checkRemoveActor,
	cleanOrphanHubs,
	initTemplateGovernanceForHub,
	toDefaultHubSettings,
} from '$lib/vocab/hub/hubHelpers.server';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	checkHubAccess,
	isCreateHubDisabled,
	checkPolicy,
} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {spaceTemplateToCreateSpaceParams, defaultCommunityHubRoles} from '$lib/app/templates';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';

const log = new Logger(gray('[') + blue('hubServices') + gray(']'));

//Returns a single hub with its related data.
export const ReadHubService: ServiceByName['ReadHub'] = {
	action: ReadHub,
	transaction: false,
	perform: async ({repos, params, account_id}) => {
		const {actor, hub_id} = params;

		log.debug('[ReadHub] account', account_id); // TODO logging
		log.debug('[ReadHub] hub', hub_id);

		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		await checkHubAccess(actor, hub_id, repos);

		const [spaces, roles, assignments] = await Promise.all([
			repos.space.filterByHub(hub_id),
			repos.role.filterByHub(hub_id),
			repos.assignment.filterByHub(hub_id),
		]);

		// TODO is this more efficient than parallelizing `actor.filterByHub`?
		const actorIds = assignments.map((a) => a.actor_id);
		const [filteredActors, directoriesResult] = await Promise.all([
			repos.actor.filterByIds(actorIds),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
		const {actors} = filteredActors;
		const {entities: directories} = directoriesResult as {entities: Directory[]};

		return {
			ok: true,
			status: 200,
			value: {hub, spaces, directories, roles, assignments, actors},
		};
	},
};

//Creates a new hub for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateHubService: ServiceByName['CreateHub'] = {
	action: CreateHub,
	transaction: true,
	perform: async ({repos, params: {actor, template}, account_id}) => {
		log.debug('creating hub account_id', account_id);
		const name = scrubActorName(template.name);
		const nameErrorMessage = checkActorName(name);
		if (nameErrorMessage) {
			return {ok: false, status: 400, message: nameErrorMessage};
		}

		if (isPersonaNameReserved(name)) {
			return {ok: false, status: 409, message: 'a hub with that name is not allowed'};
		}

		// Check for duplicate hub names.
		const existingHub = await repos.hub.findByName(name);
		if (existingHub) {
			return {ok: false, status: 409, message: 'a hub with that name already exists'};
		}

		// Check for instance settings OR admin actor
		if ((await isCreateHubDisabled(repos)) && !(await isPersonaAdmin(actor, repos))) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}

		const settings = toDefaultHubSettings(name);
		if (template.settings) {
			Object.assign(settings, template.settings);
		}

		// Create the hub
		const hub = await repos.hub.create('community', name, settings);
		const {hub_id} = hub;

		const roleTemplates = template.roles?.length ? template.roles : defaultCommunityHubRoles;
		const {roles, assignments, policies} = await initTemplateGovernanceForHub(
			repos,
			roleTemplates,
			hub,
			actor,
		);

		// Create the hub actor and its assignment
		const hubActor = await repos.actor.createCommunityActor(hub.name, hub_id);
		const hubActorAssignment = await repos.assignment.create(
			hubActor.actor_id,
			hub_id,
			hub.settings.defaultRoleId,
		);
		assignments.push(hubActorAssignment);

		// Create default spaces.
		const createSpacesParams = template.spaces?.length
			? template.spaces.map((s) => spaceTemplateToCreateSpaceParams(s, actor, hub_id))
			: toDefaultSpaces(actor, hub);
		const {spaces, directories} = await createSpaces(createSpacesParams, repos);

		return {
			ok: true,
			status: 200,
			value: {
				hub,
				roles,
				policies,
				spaces,
				directories,
				actors: [hubActor],
				assignments,
			},
		};
	},
};

export const UpdateHubSettingsService: ServiceByName['UpdateHubSettings'] = {
	action: UpdateHubSettings,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, settings} = params;
		await checkPolicy(permissions.UpdateHubSettings, actor, hub_id, repos);
		await repos.hub.updateSettings(hub_id, settings);
		return {ok: true, status: 200, value: null};
	},
};

export const DeleteHubService: ServiceByName['DeleteHub'] = {
	action: DeleteHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id} = params;
		await checkPolicy(permissions.DeleteHub, actor, hub_id, repos);

		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		if (hub.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot delete personal hub'};
		}
		if (hub.hub_id === ADMIN_HUB_ID) {
			return {ok: false, status: 405, message: 'cannot delete admin hub'};
		}
		await repos.hub.deleteById(hub_id);

		return {ok: true, status: 200, value: null};
	},
};

export const InviteToHubService: ServiceByName['InviteToHub'] = {
	action: InviteToHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, name} = params;
		await checkPolicy(permissions.InviteToHub, actor, hub_id, repos);

		const hub = await repos.hub.findById(hub_id);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		const actorToInvite = await repos.actor.findByName(name);
		if (!actorToInvite) {
			return {ok: false, status: 404, message: `cannot find actor named ${name}`};
		}
		if (await repos.assignment.isPersonaInHub(actorToInvite.actor_id, hub_id)) {
			return {ok: false, status: 409, message: 'actor is already in the hub'};
		}

		const assignment = await createAssignment(
			actorToInvite.actor_id,
			hub,
			hub.settings.defaultRoleId,
			repos,
		);
		return {ok: true, status: 200, value: {actor: actorToInvite, assignment}};
	},
};

export const LeaveHubService: ServiceByName['LeaveHub'] = {
	action: LeaveHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, actor_id, hub_id} = params;
		log.debug('[LeaveHub] removing all assignments for actor in hub', actor, actor_id, hub_id);

		if (actor !== actor_id) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}

		await checkRemoveActor(actor_id, hub_id, repos);

		await repos.assignment.deleteByPersonaAndHub(actor_id, hub_id);

		await cleanOrphanHubs([hub_id], repos);

		return {ok: true, status: 200, value: null};
	},
};

export const KickFromHubService: ServiceByName['KickFromHub'] = {
	action: KickFromHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, actor_id, hub_id} = params;
		log.debug('[KickFromHub] removing all assignments for actor in hub', actor, actor_id, hub_id);
		await checkPolicy(permissions.KickFromHub, actor, hub_id, repos);

		await checkRemoveActor(actor_id, hub_id, repos);

		await repos.assignment.deleteByPersonaAndHub(actor_id, hub_id);

		await cleanOrphanHubs([hub_id], repos);

		return {ok: true, status: 200, value: null};
	},
};
