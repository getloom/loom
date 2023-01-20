import type {Mutations} from '$lib/app/eventTypes';
import {evictSpaces, stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space, directory: $directory} = result.value;
	stashSpaces(ui, [$space], [$directory]);
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({params, invoke, ui}) => {
	const {spaceById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const space = spaceById.get(params.space_id)!;
	await evictSpaces(ui, [space]);
	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space} = result.value;
	stashSpaces(ui, [$space]);
	return result;
};

export const ReadSpaces: Mutations['ReadSpaces'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {spaces: $spaces, directories: $directories} = result.value;
	stashSpaces(ui, $spaces, $directories);
	return result;
};
