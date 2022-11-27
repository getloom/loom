import {unwrap, type Result} from '@feltcoop/util';

import type {AuthorizedServiceRequest} from '$lib/server/service';
import type {CreateSpaceParams} from '$lib/app/eventTypes';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';

export const createSpaces = async (
	serviceRequest: AuthorizedServiceRequest,
	serviceParams: CreateSpaceParams[],
): Promise<
	Result<{value: {spaces: Space[]; directories: Array<Entity & {data: DirectoryEntityData}>}}>
> => {
	const spaces: Space[] = [];
	const directories: Array<Entity & {data: DirectoryEntityData}> = [];
	for (const params of serviceParams) {
		const {space, directory} = unwrap(
			await CreateSpaceService.perform({...serviceRequest, params}), // eslint-disable-line no-await-in-loop
		);
		spaces.push(space);
		directories.push(directory);
	}
	return {ok: true, value: {spaces, directories}};
};
