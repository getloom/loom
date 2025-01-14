import type {Mutations} from '$lib/vocab/action/actionTypes.js';
import {stashEntities, evictEntities, stashTies} from '$lib/vocab/entity/entityMutationHelpers.js';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entities, ties} = result.value;
	mutate(() => {
		stashEntities(ui, afterMutation, entities);
		stashTies(ui, ties);
	});
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateEntities: Mutations['UpdateEntities'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => stashEntities(ui, afterMutation, result.value.entities));
	return result;
};

export const EraseEntities: Mutations['EraseEntities'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => stashEntities(ui, afterMutation, result.value.entities));
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => {
		evictEntities(ui, afterMutation, result.value.deleted);
		stashEntities(ui, afterMutation, result.value.entities);
	});
	return result;
};

export const ReadEntitiesById: Mutations['ReadEntitiesById'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entities} = result.value;
	mutate(() => {
		stashEntities(ui, afterMutation, entities);
	});
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({
	invoke,
	mutate,
	afterMutation,
	ui,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	mutate(() => {
		stashEntities(ui, afterMutation, entities);
		stashTies(ui, ties);
	});
	return result;
};
