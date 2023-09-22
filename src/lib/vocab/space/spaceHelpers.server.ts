import type {CreateSpaceParams, CreateSpaceResponse} from '$lib/vocab/action/actionTypes';
import type {Space} from '$lib/vocab/space/space';
import type {Directory} from '$lib/vocab/entity/entityData';
import {ApiError} from '$lib/server/api';
import {Logger} from '@grogarden/util/log.js';
import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server';

const log = new Logger(gray('[') + blue('spaceHelpers.server') + gray(']'));

//TODO change CreateSpace action to batched & refactor this away?
export const createSpaces = async (
	repos: Repos,
	serviceParams: CreateSpaceParams[],
): Promise<{spaces: Space[]; directories: Directory[]}> => {
	const spaces: Space[] = [];
	const directories: Directory[] = [];
	// TODO can this be safely batched? at what concurrency? or maybe make a batched repo method?
	for (const params of serviceParams) {
		const {space, directory} = await createSpace(repos, params); // eslint-disable-line no-await-in-loop
		spaces.push(space);
		directories.push(directory);
	}
	return {spaces, directories};
};

export const createSpace = async (
	repos: Repos,
	params: CreateSpaceParams,
): Promise<CreateSpaceResponse> => {
	const {hub_id, name, view, icon} = params;
	//TODO MULTIPLE add lowercasing to name/path
	const path = `/${name}`;
	log.debug('[createSpace] validating space path uniqueness');
	const existingDirectoryWithPath = await repos.entity.findDirectoryByHubPath(hub_id, path);
	if (existingDirectoryWithPath) {
		throw new ApiError(409, 'a space with that path already exists');
	}

	const hubActor = await repos.actor.findByHub(hub_id, ACTOR_COLUMNS.actor_id);
	if (!hubActor) {
		throw new ApiError(409, 'failed to find the hub actor');
	}

	log.debug('[CreateSpace] initializing directory for space');

	log.debug('[CreateSpace] creating space for hub', hub_id);
	const {space_id} = await repos.space.create(name, icon, view, hub_id);

	const directory = (await repos.entity.create(
		hubActor.actor_id,
		space_id,
		hub_id,
		{type: 'Collection'},
		null,
		path,
	)) as Directory;

	const space = await repos.space.init(space_id, directory.directory_id);

	return {space, directory};
};
