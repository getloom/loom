import {Logger} from '@feltjs/util/log.js';
import {unwrap} from '@feltjs/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceEvents';
import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import {cleanOrphanedEntities} from '$lib/vocab/entity/entityHelpers.server';
import {checkHubAccess, checkPolicy} from '$lib/vocab/policy/policyHelpers.server';
import {permissions} from '$lib/vocab/policy/permissions';
import {createSpace} from './spaceHelpers.server';

const log = new Logger(gray('[') + blue('spaceServices') + gray(']'));

//Returns all spaces in a given hub
export const ReadSpacesService: ServiceByName['ReadSpaces'] = {
	event: ReadSpaces,
	transaction: false,
	perform: async ({repos, params}) => {
		const {actor, hub_id} = params;
		log.trace('[ReadSpaces] retrieving spaces for hub', hub_id);

		await checkHubAccess(actor, hub_id, repos);

		const spaces = unwrap(await repos.space.filterByHub(hub_id));

		const {entities: directories} = unwrap(
			await repos.entity.filterByIds(spaces.map((s) => s.directory_id)),
		) as {entities: Array<Entity & {data: DirectoryEntityData}>};

		return {ok: true, status: 200, value: {spaces, directories}};
	},
};

//Creates a new space for a given hub
export const CreateSpaceService: ServiceByName['CreateSpace'] = {
	event: CreateSpace,
	transaction: true,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO verify `params.persona_id` is  one of the `account_id`'s personas
	perform: async ({repos, params}) => {
		const {actor, hub_id} = params;

		await checkPolicy(permissions.CreateSpace, actor, hub_id, repos);

		const {space, directory} = await createSpace(params, repos);

		return {ok: true, status: 200, value: {space, directory}};
	},
};

export const UpdateSpaceService: ServiceByName['UpdateSpace'] = {
	event: UpdateSpace,
	transaction: true,
	perform: async ({repos, params}) => {
		const {space_id, actor, ...partial} = params;
		const space = unwrap(await repos.space.findById(space_id));
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}

		await checkPolicy(permissions.UpdateSpace, actor, space.hub_id, repos);
		const updatedSpace = unwrap(await repos.space.update(space_id, partial));
		return {ok: true, status: 200, value: {space: updatedSpace}};
	},
};

//deletes a single space
export const DeleteSpaceService: ServiceByName['DeleteSpace'] = {
	event: DeleteSpace,
	transaction: true,
	perform: async ({repos, params}) => {
		log.trace('[DeleteSpace] deleting space with id:', params.space_id);

		// Check that the space can be deleted.
		const space = unwrap(await repos.space.findById(params.space_id));
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}
		const directory = unwrap(await repos.entity.findById(space.directory_id));
		if (!directory) {
			return {ok: false, status: 404, message: 'no directory found'};
		}
		if (!canDeleteSpace(directory)) {
			// TODO source this error message correctly, `canDeleteSpace` should return it, see the `check` pattern
			return {ok: false, status: 405, message: 'cannot delete home space'};
		}

		await checkPolicy(permissions.DeleteSpace, params.actor, space.hub_id, repos);

		unwrap(await repos.space.deleteById(params.space_id));

		await cleanOrphanedEntities(repos);

		return {ok: true, status: 200, value: null};
	},
};
