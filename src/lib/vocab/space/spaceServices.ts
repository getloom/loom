import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import type {ServiceByName} from '$lib/vocab/action/actionTypes.js';
import {CreateSpace, ReadSpaces, UpdateSpace, DeleteSpace} from '$lib/vocab/space/spaceActions.js';
import {canDeleteSpace, isHomeSpace} from '$lib/vocab/space/spaceHelpers.js';
import type {Directory} from '$lib/vocab/entity/entityData.js';
import {cleanOrphanedEntities} from '$lib/vocab/entity/entityHelpers.server.js';
import {createSpace} from '$lib/vocab/space/spaceHelpers.server.js';
import {ApiError} from '$lib/server/api.js';

const log = new Logger(gray('[') + blue('spaceServices') + gray(']'));

//Returns all spaces in a given hub
export const ReadSpacesService: ServiceByName['ReadSpaces'] = {
	action: ReadSpaces,
	transaction: false,
	perform: async ({repos, params, checkHubAccess}) => {
		const {hub_id} = params;
		log.debug('[ReadSpaces] retrieving spaces for hub', hub_id);

		await checkHubAccess(hub_id);

		const spaces = await repos.space.filterByHub(hub_id);

		const {entities: directories} = (await repos.entity.filterByIds(
			spaces.map((s) => s.directory_id),
		)) as {entities: Directory[]};

		return {ok: true, status: 200, value: {spaces, directories}};
	},
};

//Creates a new space for a given hub
export const CreateSpaceService: ServiceByName['CreateSpace'] = {
	action: CreateSpace,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {hub_id} = params;

		await checkPolicy('create_space', hub_id);

		const {space, directory} = await createSpace(repos, params);

		return {ok: true, status: 200, value: {space, directory}, broadcast: hub_id};
	},
};

export const UpdateSpaceService: ServiceByName['UpdateSpace'] = {
	action: UpdateSpace,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		log.debug('[updateSpace] updating space');
		const {space_id, actor, ...partial} = params;
		const space = await repos.space.findById(space_id);
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}

		await checkPolicy('update_space', space.hub_id);

		if (isHomeSpace(space)) {
			throw new ApiError(405, 'cannot update home space');
		}

		//TODO MULTIPLE add lowercasing to name/path
		if (partial.name) {
			const path = `/${partial.name}`;
			log.debug('[updateSpace] validating space path uniqueness');
			const existingDirectoryWithPath = await repos.entity.findDirectoryByHubPath(
				space.hub_id,
				path,
			);
			if (existingDirectoryWithPath) {
				throw new ApiError(409, 'a space with that path already exists');
			}
			await repos.entity.update(space.directory_id, undefined, path);
		}

		const updatedSpace = await repos.space.update(space_id, partial);
		return {ok: true, status: 200, value: {space: updatedSpace}, broadcast: space.hub_id};
	},
};

//deletes a single space
export const DeleteSpaceService: ServiceByName['DeleteSpace'] = {
	action: DeleteSpace,
	transaction: true,
	perform: async ({repos, params, checkPolicy}) => {
		const {space_id} = params;
		log.debug('[DeleteSpace] deleting space with id:', space_id);

		// Check that the space can be deleted.
		const space = await repos.space.findById(space_id);
		if (!space) {
			return {ok: false, status: 404, message: 'no space found'};
		}
		const directory = await repos.entity.findById(space.directory_id);
		if (!directory) {
			return {ok: false, status: 404, message: 'no directory found'};
		}
		if (!canDeleteSpace(directory)) {
			// TODO source this error message correctly, `canDeleteSpace` should return it, see the `check` pattern
			return {ok: false, status: 405, message: 'cannot delete home space'};
		}

		await checkPolicy('delete_space', space.hub_id);

		await repos.space.deleteById(space_id);

		await cleanOrphanedEntities(repos);

		return {ok: true, status: 200, value: null, broadcast: space.hub_id};
	},
};
