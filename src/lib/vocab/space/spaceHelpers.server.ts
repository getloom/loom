import {unwrap, type Result} from '@feltcoop/util';

import type {CreateSpaceParams, CreateSpaceResponse} from '$lib/app/eventTypes';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {ApiResult} from '$lib/server/api';
import {Logger} from '@feltcoop/util/log.js';
import {blue, gray} from '$lib/server/colors';
import type {Repos} from '$lib/db/Repos';

const log = new Logger(gray('[') + blue('spaceHelpers.server') + gray(']'));

//TODO change CreateSpace event to batched & refactor this away?
export const createSpaces = async (
	serviceParams: CreateSpaceParams[],
	repos: Repos,
): Promise<
	Result<{value: {spaces: Space[]; directories: Array<Entity & {data: DirectoryEntityData}>}}>
> => {
	const spaces: Space[] = [];
	const directories: Array<Entity & {data: DirectoryEntityData}> = [];
	// TODO can this be safely batched? at what concurrency? or maybe make a batched repo method?
	for (const params of serviceParams) {
		const {space, directory} = unwrap(
			await createSpace(params, repos), // eslint-disable-line no-await-in-loop
		);
		spaces.push(space);
		directories.push(directory);
	}
	return {ok: true, value: {spaces, directories}};
};

export const createSpace = async (
	params: CreateSpaceParams,
	repos: Repos,
): Promise<ApiResult<CreateSpaceResponse>> => {
	const {community_id, name, view, path, icon} = params;
	// TODO run this same logic when a space path is updated
	log.trace('[createSpace] validating space path uniqueness');
	const existingSpaceWithUrl = unwrap(await repos.space.findByCommunityPath(community_id, path));
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
				directory: true,
			},
			null,
		),
	) as Entity & {data: DirectoryEntityData};

	log.trace('[CreateSpace] creating space for community', community_id);
	const space = unwrap(
		await repos.space.create(
			name,
			view,
			path,
			icon,
			community_id,
			uninitializedDirectory.entity_id,
		),
	);

	// set `uninitializedDirectory.space_id` now that the space has been created
	const directory = unwrap(
		await repos.entity.update(uninitializedDirectory.entity_id, null, space.space_id),
	) as Entity & {data: DirectoryEntityData};

	return {ok: true, status: 200, value: {space, directory}};
};
