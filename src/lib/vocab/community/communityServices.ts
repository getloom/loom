import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	InviteToCommunity,
	LeaveCommunity,
	KickFromCommunity,
} from '$lib/vocab/community/communityEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {checkPersonaName, scrubPersonaName} from '$lib/vocab/persona/personaHelpers';
import {isPersonaAdmin, isPersonaNameReserved} from '$lib/vocab/persona/personaHelpers.server';
import {
	checkRemovePersona,
	cleanOrphanCommunities,
	initTemplateGovernanceForCommunity,
} from '$lib/vocab/community/communityHelpers.server';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {
	checkCommunityAccess,
	isCreateCommunityDisabled,
	checkPolicy,
} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {spaceTemplateToCreateSpaceParams, defaultStandardCommunityRoles} from '$lib/app/templates';
import {createAssignment} from '$lib/vocab/assignment/assignmentHelpers.server';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

//Returns a single community with its related data.
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		const {actor, community_id} = params;

		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', community_id);

		const community = unwrap(await repos.community.findById(community_id));
		if (!community) {
			return {ok: false, status: 404, message: 'no community found'};
		}

		unwrap(await checkCommunityAccess(actor, community_id, repos));

		const [spacesResult, rolesResult, assignmentsResult] = await Promise.all([
			repos.space.filterByCommunity(community_id),
			repos.role.filterByCommunity(community_id),
			repos.assignment.filterByCommunity(community_id),
		]);
		const spaces = unwrap(spacesResult);
		const roles = unwrap(rolesResult);
		const assignments = unwrap(assignmentsResult);

		// TODO is this more efficient than parallelizing `persona.filterByCommunity`?
		const personaIds = assignments.map((a) => a.persona_id);
		const [personasResult, directoriesResult] = await Promise.all([
			repos.persona.filterByIds(personaIds),
			repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		]);
		const {personas} = unwrap(personasResult);
		const {entities: directories} = unwrap(directoriesResult) as {
			entities: Array<Entity & {data: DirectoryEntityData}>;
		};

		return {
			ok: true,
			status: 200,
			value: {community, spaces, directories, roles, assignments, personas},
		};
	},
};

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateCommunityService: ServiceByName['CreateCommunity'] = {
	event: CreateCommunity,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {
				params: {actor, template},
				account_id,
			} = serviceRequest;
			log.trace('creating community account_id', account_id);
			const name = scrubPersonaName(template.name);
			const nameErrorMessage = checkPersonaName(name);
			if (nameErrorMessage) {
				return {ok: false, status: 400, message: nameErrorMessage};
			}

			if (isPersonaNameReserved(name)) {
				return {ok: false, status: 409, message: 'a community with that name is not allowed'};
			}

			// Check for duplicate community names.
			const existingCommunity = unwrap(await repos.community.findByName(name), 'custom');
			if (existingCommunity) {
				return {ok: false, status: 409, message: 'a community with that name already exists'};
			}

			// Check for instance settings OR admin actor
			if ((await isCreateCommunityDisabled(repos)) && !(await isPersonaAdmin(actor, repos))) {
				return {ok: false, status: 403, message: 'actor does not have permission'};
			}

			const settings = toDefaultCommunitySettings(name);
			if (template.settings) {
				Object.assign(settings, template.settings);
			}

			// Create the community
			const community = unwrap(await repos.community.create('standard', name, settings));
			const {community_id} = community;

			const roleTemplates = template.roles?.length ? template.roles : defaultStandardCommunityRoles;
			const {roles, assignments, policies} = unwrap(
				await initTemplateGovernanceForCommunity(repos, roleTemplates, community, actor),
			);

			// Create the community persona and its assignment
			const communityPersona = unwrap(
				await repos.persona.createCommunityPersona(community.name, community_id),
			);
			const communityPersonaAssignment = unwrap(
				await repos.assignment.create(
					communityPersona.persona_id,
					community_id,
					community.settings.defaultRoleId,
				),
			);
			assignments.push(communityPersonaAssignment);

			// Create default spaces.
			const createSpacesParams = template.spaces?.length
				? template.spaces.map((s) => spaceTemplateToCreateSpaceParams(s, actor, community_id))
				: toDefaultSpaces(actor, community);
			const {spaces, directories} = unwrap(await createSpaces(createSpacesParams, repos));

			return {
				ok: true,
				status: 200,
				value: {
					community,
					roles,
					policies,
					spaces,
					directories,
					personas: [communityPersona],
					assignments,
				},
			};
		}),
};

export const UpdateCommunitySettingsService: ServiceByName['UpdateCommunitySettings'] = {
	event: UpdateCommunitySettings,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, community_id, settings} = params;
			unwrap(await checkPolicy(permissions.UpdateCommunitySettings, actor, community_id, repos));
			unwrap(await repos.community.updateSettings(community_id, settings));
			return {ok: true, status: 200, value: null};
		}),
};

export const DeleteCommunityService: ServiceByName['DeleteCommunity'] = {
	event: DeleteCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, community_id} = params;
			unwrap(await checkPolicy(permissions.DeleteCommunity, actor, community_id, repos));

			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}

			if (community.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot delete personal community'};
			}
			if (community.community_id === ADMIN_COMMUNITY_ID) {
				return {ok: false, status: 405, message: 'cannot delete admin community'};
			}
			unwrap(await repos.community.deleteById(community_id));

			return {ok: true, status: 200, value: null};
		}),
};

export const InviteToCommunityService: ServiceByName['InviteToCommunity'] = {
	event: InviteToCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, community_id, name} = params;
			unwrap(await checkPolicy(permissions.InviteToCommunity, actor, community_id, repos));

			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}

			const persona = unwrap(await repos.persona.findByName(name));
			if (!persona) {
				return {ok: false, status: 404, message: `cannot find a persona named ${name}`};
			}
			if (unwrap(await repos.assignment.isPersonaInCommunity(persona.persona_id, community_id))) {
				return {ok: false, status: 409, message: 'persona is already in the community'};
			}

			const assignment = unwrap(
				await createAssignment(
					persona.persona_id,
					community,
					community.settings.defaultRoleId,
					repos,
				),
			);
			return {ok: true, status: 200, value: {persona, assignment}};
		}),
};

export const LeaveCommunityService: ServiceByName['LeaveCommunity'] = {
	event: LeaveCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, persona_id, community_id} = params;
			log.trace(
				'[LeaveCommunity] removing all assignments for persona in community',
				actor,
				persona_id,
				community_id,
			);

			unwrap(await checkCommunityAccess(persona_id, community_id, repos));

			if (actor !== persona_id) {
				return {ok: false, status: 403, message: 'actor does not have permission'};
			}

			unwrap(await checkRemovePersona(persona_id, community_id, repos));

			unwrap(await repos.assignment.deleteByPersonaAndCommunity(persona_id, community_id));

			unwrap(await cleanOrphanCommunities([community_id], repos));

			return {ok: true, status: 200, value: null};
		}),
};

export const KickFromCommunityService: ServiceByName['KickFromCommunity'] = {
	event: KickFromCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {actor, persona_id, community_id} = params;
			log.trace(
				'[KickFromCommunity] removing all assignments for persona in community',
				actor,
				persona_id,
				community_id,
			);
			unwrap(await checkPolicy(permissions.KickFromCommunity, actor, community_id, repos));

			unwrap(await checkRemovePersona(persona_id, community_id, repos));

			unwrap(await repos.assignment.deleteByPersonaAndCommunity(persona_id, community_id));

			unwrap(await cleanOrphanCommunities([community_id], repos));

			return {ok: true, status: 200, value: null};
		}),
};
