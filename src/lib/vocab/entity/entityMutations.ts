import {mutable} from '@feltcoop/svelte-gettable-stores';

import type {Mutations} from '$lib/app/eventTypes';
import {stashEntities, evictEntities, stashTies} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entity, tie} = result.value;
	stashEntities(ui, [entity]);
	stashTies(ui, [tie]);
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateEntity: Mutations['UpdateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	stashEntities(ui, [result.value.entity]);
	return result;
};

export const EraseEntities: Mutations['EraseEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	stashEntities(ui, result.value.entities);
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({invoke, ui, params}) => {
	const result = await invoke();
	if (!result.ok) return result;
	evictEntities(ui, params.entityIds);
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	stashEntities(ui, entities);
	stashTies(ui, ties);
	return result;
};

// TODO implement this along with `ReadEntities` to use the same query and caching structures
export const ReadEntitiesPaginated: Mutations['ReadEntitiesPaginated'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	stashEntities(ui, entities);
	stashTies(ui, ties);
	return result;
};

//TODO rethink this caching element
export const QueryEntities: Mutations['QueryEntities'] = ({
	ui: {entitiesBySourceId},
	dispatch,
	params,
}) => {
	let destEntities = entitiesBySourceId.get(params.source_id);
	if (!destEntities) {
		entitiesBySourceId.set(params.source_id, (destEntities = mutable(new Set())));
		void dispatch.ReadEntities(params);
	}
	return destEntities;
};
