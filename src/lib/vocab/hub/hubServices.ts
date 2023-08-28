import {Logger} from '@feltjs/util/log.js';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/vocab/action/actionTypes';
import {
	CreateHub,
	ReadHub,
	UpdateHub,
	DeleteHub,
	InviteToHub,
	LeaveHub,
	KickFromHub,
} from '$lib/vocab/hub/hubActions';
import {ADMIN_HUB_ID} from '$lib/util/constants';
import type {Directory} from '$lib/vocab/entity/entityData';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {checkActorName, scrubActorName} from '$lib/vocab/actor/actorHelpers';
import {
	ACTOR_COLUMNS,
	isActorAdmin,
	isActorNameReserved,
} from '$lib/vocab/actor/actorHelpers.server';
import {
	HUB_COLUMNS,
	checkRemoveActor,
	cleanOrphanHubs,
	deleteHub,
	initTemplateGovernanceForHub,
	toDefaultHubSettings,
} from '$lib/vocab/hub/hubHelpers.server';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	checkHubAccess,
	isCreateHubDisabled,
	checkPolicy,
} from '$lib/vocab/policy/policyHelpers.server';
import {spaceTemplateToCreateSpaceParams, defaultCommunityHubRoles} from '$lib/ui/templates';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';
import {ApiError, assertApiError} from '$lib/server/api';

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
		const [{actors}, directoriesResult] = await Promise.all([
			repos.actor.filterByIds(actorIds, ACTOR_COLUMNS.public),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
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
	perform: async ({repos, params: {actor, template}, account_id, broadcast}) => {
		log.debug('creating hub account_id', account_id);
		const name = scrubActorName(template.name);
		assertApiError(checkActorName(name));

		if (isActorNameReserved(name)) {
			return {ok: false, status: 409, message: 'a hub with that name is not allowed'};
		}

		// Check for duplicate hub names.
		const existingHub = await repos.hub.findByName(name, HUB_COLUMNS.hub_id);
		if (existingHub) {
			return {ok: false, status: 409, message: 'a hub with that name already exists'};
		}

		// Check for instance settings OR admin actor
		if ((await isCreateHubDisabled(repos)) && !(await isActorAdmin(actor, repos))) {
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
		const hubActor = await repos.actor.createHubActor(hub.name, hub_id);
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

		await broadcast.createHub(hub_id, account_id, actor);

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

export const UpdateHubService: ServiceByName['UpdateHub'] = {
	action: UpdateHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, settings} = params;
		await checkPolicy('update_hub', actor, hub_id, repos);
		// TODO probably refactor `repos.hub.updateSettings` to return the updated document,
		// as well as conditionally handle other updatable properties of `hub`
		if (settings) {
			await repos.hub.updateSettings(hub_id, settings);
		}
		const updated = await repos.hub.findById(hub_id);
		if (!updated) throw new ApiError(404, 'no hub found');
		return {ok: true, status: 200, value: {hub: updated}, broadcast: hub_id};
	},
};

export const DeleteHubService: ServiceByName['DeleteHub'] = {
	action: DeleteHub,
	transaction: true,
	perform: async ({repos, params, broadcast}) => {
		const {actor, hub_id} = params;
		await checkPolicy('delete_hub', actor, hub_id, repos);

		const hub = await repos.hub.findById(hub_id, HUB_COLUMNS.hub_id_type);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		if (hub.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot delete personal hub'};
		}
		if (hub.hub_id === ADMIN_HUB_ID) {
			return {ok: false, status: 405, message: 'cannot delete admin hub'};
		}
		await deleteHub(repos, hub_id);

		await broadcast.deleteHub(hub_id);

		return {ok: true, status: 200, value: null};
	},
};

export const InviteToHubService: ServiceByName['InviteToHub'] = {
	action: InviteToHub,
	transaction: true,
	perform: async ({repos, params, broadcast}) => {
		const {actor, hub_id, name} = params;
		await checkPolicy('invite_to_hub', actor, hub_id, repos);

		const hub = await repos.hub.findById(hub_id, HUB_COLUMNS.hub_id_type_settings);
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		const found = await repos.actor.findByName(name, ACTOR_COLUMNS.public_with_account_id);
		if (!found) {
			return {ok: false, status: 404, message: `cannot find actor with that name`};
		}
		const {account_id: accountIdToInvite, ...actorToInvite} = found;
		if (await repos.assignment.isActorInHub(actorToInvite.actor_id, hub_id)) {
			return {ok: false, status: 409, message: 'actor is already in the hub'};
		}

		const assignment = await createAssignment(
			actorToInvite.actor_id,
			hub,
			hub.settings.defaultRoleId,
			repos,
		);

		await broadcast.addActor(hub_id, accountIdToInvite, actorToInvite.actor_id);

		return {ok: true, status: 200, value: {actor: actorToInvite, assignment}, broadcast: hub_id};
	},
};

export const LeaveHubService: ServiceByName['LeaveHub'] = {
	action: LeaveHub,
	transaction: true,
	perform: async ({repos, params, broadcast}) => {
		const {actor, actor_id, hub_id} = params;
		log.debug('[LeaveHub] removing all assignments for actor in hub', actor, actor_id, hub_id);

		if (actor !== actor_id) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}

		await checkRemoveActor(actor_id, hub_id, repos);

		await repos.assignment.deleteByActorAndHub(actor_id, hub_id);

		await cleanOrphanHubs([hub_id], repos);

		const actorToLeave = await repos.actor.findById(actor_id, ACTOR_COLUMNS.account_id);
		if (!actorToLeave) {
			return {ok: false, status: 404, message: 'no actor found'};
		}

		await broadcast.removeActor(hub_id, actorToLeave.account_id, actor_id);

		return {ok: true, status: 200, value: null, broadcast: hub_id};
	},
};

export const KickFromHubService: ServiceByName['KickFromHub'] = {
	action: KickFromHub,
	transaction: true,
	perform: async ({repos, params, broadcast}) => {
		const {actor, actor_id, hub_id} = params;
		log.debug('[KickFromHub] removing all assignments for actor in hub', actor, actor_id, hub_id);
		await checkPolicy('kick_from_hub', actor, hub_id, repos);

		await checkRemoveActor(actor_id, hub_id, repos);

		await repos.assignment.deleteByActorAndHub(actor_id, hub_id);

		await cleanOrphanHubs([hub_id], repos);

		const actorToKick = await repos.actor.findById(actor_id, ACTOR_COLUMNS.account_id);
		if (!actorToKick) {
			return {ok: false, status: 404, message: 'no actor found'};
		}

		await broadcast.removeActor(hub_id, actorToKick.account_id, actor_id);

		return {ok: true, status: 200, value: null, broadcast: hub_id};
	},
};
