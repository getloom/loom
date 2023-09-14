import type {Mutations} from '$lib/vocab/action/actionTypes';
import {evictSpaces, stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space, directory} = result.value;
	mutate(() => stashSpaces(ui, afterMutation, [space], [directory]));
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({
	params,
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const {spaceById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const space = spaceById.get(params.space_id)!;
	mutate(() => evictSpaces(ui, afterMutation, [space]));
	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space} = result.value;
	mutate(() => stashSpaces(ui, afterMutation, [space]));
	return result;
};

export const ReadSpaces: Mutations['ReadSpaces'] = async ({invoke, mutate, afterMutation, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {spaces, directories} = result.value;
	mutate(() => stashSpaces(ui, afterMutation, spaces, directories));
	return result;
};
