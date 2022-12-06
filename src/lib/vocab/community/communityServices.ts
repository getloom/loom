import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunities,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
	InviteToCommunity,
	LeaveCommunity,
} from '$lib/vocab/community/communityEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
import type {ActorPersona} from '$lib/vocab/persona/persona';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {checkPersonaName, scrubPersonaName} from '$lib/vocab/persona/personaHelpers';
import {isPersonaNameReserved} from '$lib/vocab/persona/personaHelpers.server';
import {
	cleanOrphanCommunities,
	initDefaultRoleForCommunity,
} from '$lib/vocab/community/communityHelpers.server';
import {createSpaces} from '$lib/vocab/space/spaceHelpers.server';
import {CreateAssignmentService} from '../assignment/assignmentServices';
import type {AuthorizedServiceRequest} from '$lib/server/service';
import {checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

// Returns a list of community objects
export const ReadCommunitiesService: ServiceByName['ReadCommunities'] = {
	event: ReadCommunities,
	perform: async ({repos, account_id}) => {
		const communities = unwrap(await repos.community.filterByAccount(account_id));
		return {ok: true, status: 200, value: {communities}};
	},
};

//Returns a single community with its related data.
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		const {community_id} = params;

		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', community_id);

		const community = unwrap(await repos.community.findById(community_id));
		if (!community) {
			return {ok: false, status: 404, message: 'no community found'};
		}

		const [spacesResult, rolesResult, assignmentsResult] = await Promise.all([
			repos.space.filterByCommunity(community_id),
			repos.role.filterByCommunityId(community_id),
			repos.assignment.filterByCommunityId(community_id),
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
			const {params, account_id} = serviceRequest;
			log.trace('creating community account_id', account_id);
			const name = scrubPersonaName(params.name);
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

			let settings = toDefaultCommunitySettings(name);
			if (params.settings) {
				settings = {...settings, ...params.settings};
			}

			// Create the community
			const community = unwrap(await repos.community.create('standard', name, settings));

			// Create the default role and assign it
			const role = unwrap(await initDefaultRoleForCommunity(repos, community));

			// Create the community persona and its assignment
			const communityPersona = unwrap(
				await repos.persona.createCommunityPersona(community.name, community.community_id),
			);
			const communityPersonaAssignment = unwrap(
				await repos.assignment.create(
					communityPersona.persona_id,
					community.community_id,
					community.settings.defaultRoleId,
				),
			);

			// Create the assignment for the persona that's creating the community.
			const creatorAssignment = unwrap(
				await repos.assignment.create(
					params.actor,
					community.community_id,
					community.settings.defaultRoleId,
				),
			);

			// Create default spaces.
			const {spaces, directories} = unwrap(
				await createSpaces(serviceRequest, toDefaultSpaces(params.actor, community)),
			);

			return {
				ok: true,
				status: 200,
				value: {
					community,
					role,
					spaces,
					directories,
					personas: [communityPersona],
					assignments: [communityPersonaAssignment, creatorAssignment],
				},
			};
		}),
};

export const UpdateCommunitySettingsService: ServiceByName['UpdateCommunitySettings'] = {
	event: UpdateCommunitySettings,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			unwrap(
				await checkPolicy(
					params.actor,
					params.community_id,
					permissions.UpdateCommunitySettings,
					repos,
				),
			);
			unwrap(await repos.community.updateSettings(params.community_id, params.settings));
			return {ok: true, status: 200, value: null};
		}),
};

export const DeleteCommunityService: ServiceByName['DeleteCommunity'] = {
	event: DeleteCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {community_id} = params;
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
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params} = serviceRequest;

			const {actor, community_id, name} = params;

			const community = unwrap(await repos.community.findById(community_id));
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}

			const persona = unwrap(await repos.persona.findByName(name));
			if (!persona) {
				return {ok: false, status: 404, message: `cannot find a persona named ${name}`};
			}

			const {assignment} = unwrap(
				await CreateAssignmentService.perform({
					...(serviceRequest as AuthorizedServiceRequest), // TODO figure out how to avoid casting without extracting a helper
					params: {
						actor,
						community_id,
						persona_id: persona.persona_id,
						role_id: community.settings.defaultRoleId,
					},
				}),
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
			// TODO why can't this be parallelized? bug in our code? or the driver? failed to reproduce in the driver.
			// const [personaResult, communityResult] = await Promise.all([
			// 	repos.persona.findById(persona_id),
			// 	repos.community.findById(community_id),
			// ]);
			const persona = unwrap(
				await repos.persona.findById<Pick<ActorPersona, 'type' | 'community_id'>>(persona_id, [
					'type',
					'community_id',
				]),
			);
			const community = unwrap(await repos.community.findById(community_id));
			if (!persona) {
				return {ok: false, status: 404, message: 'no persona found'};
			}
			if (!community) {
				return {ok: false, status: 404, message: 'no community found'};
			}
			if (community.type === 'personal') {
				return {ok: false, status: 405, message: 'cannot leave a personal community'};
			}
			if (community_id === ADMIN_COMMUNITY_ID) {
				const adminAssignmentsCount = unwrap(
					await repos.assignment.countAccountPersonaAssignmentsByCommunityId(community_id),
				);
				if (adminAssignmentsCount === 1) {
					return {ok: false, status: 405, message: 'cannot orphan the admin community'};
				}
			}
			if (persona.type === 'community' && persona.community_id === community_id) {
				return {ok: false, status: 405, message: 'community persona cannot leave its community'};
			}

			unwrap(await repos.assignment.deleteByPersonaAndCommunity(persona_id, community_id));

			unwrap(await cleanOrphanCommunities(params.community_id, repos));

			return {ok: true, status: 200, value: null};
		}),
};
