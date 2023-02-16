import {mutable, writable} from '@feltcoop/svelte-gettable-stores';

import type {Mutations} from '$lib/app/eventTypes';
import {stashEntities, evictEntities, stashTies} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entities, ties} = result.value;
	stashEntities(ui, entities);
	stashTies(ui, ties);
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

export const ReadEntitiesPaginated: Mutations['ReadEntitiesPaginated'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	stashEntities(ui, entities);
	stashTies(ui, ties);
	return result;
};

export const QueryEntities: Mutations['QueryEntities'] = ({ui: {queryByKey}, dispatch, params}) => {
	let query = queryByKey.get(params.source_id);
	if (!query) {
		queryByKey.set(
			params.source_id,
			(query = {
				data: mutable(new Set()),
				status: writable('pending'),
				error: writable(null),
			}),
		);
		void dispatch.ReadEntities(params).then(
			(result) => {
				if (!query) return;
				if (result.ok) {
					query.status.set('success');
				} else {
					query.status.set('failure');
					query.error.set(result.message);
				}
			},
			() => {
				if (!query) return;
				query.status.set('failure');
				query.error.set('unknown error');
			},
		);
	}
	return query;
};
