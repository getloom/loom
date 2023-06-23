import type {Mutations} from '$lib/vocab/action/actionTypes';
import {stashEntities, evictEntities, stashTies} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entities, ties} = result.value;
	ui.mutate(() => {
		stashEntities(ui, entities);
		stashTies(ui, ties);
	});
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateEntities: Mutations['UpdateEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ui.mutate(() => stashEntities(ui, result.value.entities));
	return result;
};

export const EraseEntities: Mutations['EraseEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ui.mutate(() => stashEntities(ui, result.value.entities));
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ui.mutate(() => {
		evictEntities(ui, result.value.deleted);
		stashEntities(ui, result.value.entities);
	});
	return result;
};

export const ReadEntitiesById: Mutations['ReadEntitiesById'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entities} = result.value;
	ui.mutate(() => {
		stashEntities(ui, entities);
	});
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	ui.mutate(() => {
		stashEntities(ui, entities);
		stashTies(ui, ties);
	});
	return result;
};
