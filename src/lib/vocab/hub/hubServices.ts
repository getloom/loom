import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

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
} from '$lib/vocab/hub/hubEvents';
import {ADMIN_HUB_ID} from '$lib/app/constants';
import type {Directory} from '$lib/vocab/entity/entityData';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {checkPersonaName, scrubPersonaName} from '$lib/vocab/actor/personaHelpers';
import {isPersonaAdmin, isPersonaNameReserved} from '$lib/vocab/actor/personaHelpers.server';
import {
	checkRemovePersona,
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
	event: ReadHub,
	transaction: false,
	perform: async ({repos, params, account_id}) => {
		const {actor, hub_id} = params;

		log.trace('[ReadHub] account', account_id); // TODO logging
		log.trace('[ReadHub] hub', hub_id);

		const hub = unwrap(await repos.hub.findById(hub_id));
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		await checkHubAccess(actor, hub_id, repos);

		const [spaces, roles, assignmentsResult] = await Promise.all([
			repos.space.filterByHub(hub_id),
			repos.role.filterByHub(hub_id),
			repos.assignment.filterByHub(hub_id),
		]);
		const assignments = unwrap(assignmentsResult);

		// TODO is this more efficient than parallelizing `persona.filterByHub`?
		const personaIds = assignments.map((a) => a.persona_id);
		const [personasResult, directoriesResult] = await Promise.all([
			repos.persona.filterByIds(personaIds),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
		const {personas} = unwrap(personasResult);
		const {entities: directories} = unwrap(directoriesResult) as {
			entities: Directory[];
		};

		return {
			ok: true,
			status: 200,
			value: {hub, spaces, directories, roles, assignments, personas},
		};
	},
};

//Creates a new hub for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateHubService: ServiceByName['CreateHub'] = {
	event: CreateHub,
	transaction: true,
	perform: async ({repos, params: {actor, template}, account_id}) => {
		log.trace('creating hub account_id', account_id);
		const name = scrubPersonaName(template.name);
		const nameErrorMessage = checkPersonaName(name);
		if (nameErrorMessage) {
			return {ok: false, status: 400, message: nameErrorMessage};
		}

		if (isPersonaNameReserved(name)) {
			return {ok: false, status: 409, message: 'a hub with that name is not allowed'};
		}

		// Check for duplicate hub names.
		const existingHub = unwrap(await repos.hub.findByName(name), 'custom');
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
		const hub = unwrap(await repos.hub.create('community', name, settings));
		const {hub_id} = hub;

		const roleTemplates = template.roles?.length ? template.roles : defaultCommunityHubRoles;
		const {roles, assignments, policies} = await initTemplateGovernanceForHub(
			repos,
			roleTemplates,
			hub,
			actor,
		);

		// Create the hub persona and its assignment
		const hubPersona = unwrap(await repos.persona.createCommunityPersona(hub.name, hub_id));
		const hubPersonaAssignment = unwrap(
			await repos.assignment.create(hubPersona.persona_id, hub_id, hub.settings.defaultRoleId),
		);
		assignments.push(hubPersonaAssignment);

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
				personas: [hubPersona],
				assignments,
			},
		};
	},
};

export const UpdateHubSettingsService: ServiceByName['UpdateHubSettings'] = {
	event: UpdateHubSettings,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, settings} = params;
		await checkPolicy(permissions.UpdateHubSettings, actor, hub_id, repos);
		unwrap(await repos.hub.updateSettings(hub_id, settings));
		return {ok: true, status: 200, value: null};
	},
};

export const DeleteHubService: ServiceByName['DeleteHub'] = {
	event: DeleteHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id} = params;
		await checkPolicy(permissions.DeleteHub, actor, hub_id, repos);

		const hub = unwrap(await repos.hub.findById(hub_id));
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		if (hub.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot delete personal hub'};
		}
		if (hub.hub_id === ADMIN_HUB_ID) {
			return {ok: false, status: 405, message: 'cannot delete admin hub'};
		}
		unwrap(await repos.hub.deleteById(hub_id));

		return {ok: true, status: 200, value: null};
	},
};

export const InviteToHubService: ServiceByName['InviteToHub'] = {
	event: InviteToHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, hub_id, name} = params;
		await checkPolicy(permissions.InviteToHub, actor, hub_id, repos);

		const hub = unwrap(await repos.hub.findById(hub_id));
		if (!hub) {
			return {ok: false, status: 404, message: 'no hub found'};
		}

		const persona = unwrap(await repos.persona.findByName(name));
		if (!persona) {
			return {ok: false, status: 404, message: `cannot find a persona named ${name}`};
		}
		if (unwrap(await repos.assignment.isPersonaInHub(persona.persona_id, hub_id))) {
			return {ok: false, status: 409, message: 'persona is already in the hub'};
		}

		const assignment = await createAssignment(
			persona.persona_id,
			hub,
			hub.settings.defaultRoleId,
			repos,
		);
		return {ok: true, status: 200, value: {persona, assignment}};
	},
};

export const LeaveHubService: ServiceByName['LeaveHub'] = {
	event: LeaveHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, targetActor, hub_id} = params;
		log.trace('[LeaveHub] removing all assignments for persona in hub', actor, targetActor, hub_id);

		if (actor !== targetActor) {
			return {ok: false, status: 403, message: 'actor does not have permission'};
		}

		await checkRemovePersona(targetActor, hub_id, repos);

		unwrap(await repos.assignment.deleteByPersonaAndHub(targetActor, hub_id));

		await cleanOrphanHubs([hub_id], repos);

		return {ok: true, status: 200, value: null};
	},
};

export const KickFromHubService: ServiceByName['KickFromHub'] = {
	event: KickFromHub,
	transaction: true,
	perform: async ({repos, params}) => {
		const {actor, targetActor, hub_id} = params;
		log.trace(
			'[KickFromHub] removing all assignments for persona in hub',
			actor,
			targetActor,
			hub_id,
		);
		await checkPolicy(permissions.KickFromHub, actor, hub_id, repos);

		await checkRemovePersona(targetActor, hub_id, repos);

		unwrap(await repos.assignment.deleteByPersonaAndHub(targetActor, hub_id));

		await cleanOrphanHubs([hub_id], repos);

		return {ok: true, status: 200, value: null};
	},
};
