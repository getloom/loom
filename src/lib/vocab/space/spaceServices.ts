import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateSpace,
	ReadSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
} from '$lib/vocab/space/spaceEvents';
import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import {cleanOrphanedEntities} from '$lib/vocab/entity/entityHelpers.server';

const log = new Logger(gray('[') + blue('spaceServices') + gray(']'));

//Returns a single space object and its directory.
export const ReadSpaceService: ServiceByName['ReadSpace'] = {
	event: ReadSpace,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpace] space', params.space_id);

		const space = unwrap(await repos.space.findById(params.space_id));
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}

		const directory = unwrap(await repos.entity.findById(space.directory_id)) as
			| (Entity & {data: DirectoryEntityData})
			| undefined;
		if (!directory) {
			return {ok: false, status: 404, message: 'no directory found'};
		}

		return {ok: true, status: 200, value: {space, directory}};
	},
};

//Returns all spaces in a given community
export const ReadSpacesService: ServiceByName['ReadSpaces'] = {
	event: ReadSpaces,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpaces] retrieving spaces for community', params.community_id);

		const spaces = unwrap(await repos.space.filterByCommunity(params.community_id));

		const {entities: directories} = unwrap(
			await repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		) as {entities: Array<Entity & {data: DirectoryEntityData}>};

		return {ok: true, status: 200, value: {spaces, directories}};
	},
};

//Creates a new space for a given community
export const CreateSpaceService: ServiceByName['CreateSpace'] = {
	event: CreateSpace,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO verify `params.persona_id` is  one of the `account_id`'s personas
	perform: ({transact, params}) =>
		transact(async (repos) => {
			log.trace('[CreateSpace] validating space path uniqueness');
			const {community_id} = params;

			// TODO run this same logic when a space path is updated
			const existingSpaceWithUrl = unwrap(
				await repos.space.findByCommunityUrl(community_id, params.path),
			);
			if (existingSpaceWithUrl) {
				return {ok: false, status: 409, message: 'a space with that path already exists'};
			}

			const communityPersona = unwrap(await repos.persona.findByCommunity(community_id));
			if (!communityPersona) {
				return {ok: false, status: 409, message: 'failed to find the community persona'};
			}

			log.trace('[CreateSpace] initializing directory for space');
			const uninitializedDirectory = unwrap(
				await repos.entity.create(
					communityPersona.persona_id,
					{
						type: 'Collection',
						space_id: undefined as any, // `space_id` gets added below, after the space is created
					},
					null,
				),
			) as Entity & {data: DirectoryEntityData};

			log.trace('[CreateSpace] creating space for community', community_id);
			const space = unwrap(
				await repos.space.create(
					params.name,
					params.view,
					params.path,
					params.icon,
					community_id,
					uninitializedDirectory.entity_id,
				),
			);

			// set `uninitializedDirectory.data.space_id` now that the space has been created
			const directory = unwrap(
				await repos.entity.update(
					uninitializedDirectory.entity_id,
					{
						...uninitializedDirectory.data,
						space_id: space.space_id,
					},
					space.space_id,
				),
			) as Entity & {data: DirectoryEntityData};

			return {ok: true, status: 200, value: {space, directory}};
		}),
};

export const UpdateSpaceService: ServiceByName['UpdateSpace'] = {
	event: UpdateSpace,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const {space_id, actor: _actor, ...partial} = params;
			const space = unwrap(await repos.space.update(space_id, partial));
			return {ok: true, status: 200, value: {space}};
		}),
};

//deletes a single space
export const DeleteSpaceService: ServiceByName['DeleteSpace'] = {
	event: DeleteSpace,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params} = serviceRequest;
			log.trace('[DeleteSpace] deleting space with id:', params.space_id);

			// Check that the space can be deleted.
			const space = unwrap(await repos.space.findById(params.space_id));
			if (!space) {
				return {ok: false, status: 404, message: 'no space found'};
			}
			if (!canDeleteSpace(space)) {
				return {ok: false, status: 405, message: 'cannot delete home space'};
			}

			unwrap(await repos.space.deleteById(params.space_id));

			unwrap(await cleanOrphanedEntities(repos));

			return {ok: true, status: 200, value: null};
		}),
};
