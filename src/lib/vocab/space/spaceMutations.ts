import type {Mutations} from '$lib/app/eventTypes';
import {evictSpaces, upsertSpaces} from '$lib/vocab/space/spaceMutationHelpers';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space, directory: $directory} = result.value;
	upsertSpaces(ui, [$space], [$directory]);
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

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, params, ui: {spaceById}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO maybe return to $entity naming convention OR propagate this pattern?
	const {space: updatedSpace} = result.value;
	const space = spaceById.get(params.space_id);
	space!.set(updatedSpace);
	return result;
};

export const ReadSpace: Mutations['ReadSpace'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space, directory: $directory} = result.value;
	upsertSpaces(ui, [$space], [$directory]);
	return result;
};

export const ReadSpaces: Mutations['ReadSpaces'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {spaces: $spaces, directories: $directories} = result.value;
	upsertSpaces(ui, $spaces, $directories);
	return result;
};
