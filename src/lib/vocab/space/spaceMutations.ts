import type {Mutations} from '$lib/app/actionTypes';
import {evictSpaces, stashSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space, directory} = result.value;
	ui.mutate(() => stashSpaces(ui, [space], [directory]));
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({params, invoke, ui}) => {
	const {spaceById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const space = spaceById.get(params.space_id)!;
	ui.mutate(() => evictSpaces(ui, [space]));
	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space} = result.value;
	ui.mutate(() => stashSpaces(ui, [space]));
	return result;
};

export const ReadSpaces: Mutations['ReadSpaces'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {spaces, directories} = result.value;
	ui.mutate(() => stashSpaces(ui, spaces, directories));
	return result;
};
