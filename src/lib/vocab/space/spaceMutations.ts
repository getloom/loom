import type {Mutations} from '$lib/vocab/action/actionTypes';
import {evictSpaces, stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space, directory} = result.value;
	mutate(() => stashSpaces(ui, [space], [directory]));
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({params, invoke, mutate, ui}) => {
	const {spaceById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const space = spaceById.get(params.space_id)!;
	mutate(() => evictSpaces(ui, [space]));
	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space} = result.value;
	mutate(() => stashSpaces(ui, [space]));
	return result;
};

export const ReadSpaces: Mutations['ReadSpaces'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {spaces, directories} = result.value;
	mutate(() => stashSpaces(ui, spaces, directories));
	return result;
};
