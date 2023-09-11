import type {Mutations} from '$lib/vocab/action/actionTypes';
import {evictRoles, stashRoles} from '$lib/vocab/role/roleMutationHelpers';

export const CreateRole: Mutations['CreateRole'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {role} = result.value;
	mutate(() => stashRoles(ui, [role]));
	return result;
};

export const UpdateRole: Mutations['UpdateRole'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {role} = result.value;
	mutate(() => stashRoles(ui, [role]));
	return result;
};

export const DeleteRole: Mutations['DeleteRole'] = async ({invoke, mutate, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	mutate(() => evictRoles(ui, [params.role_id]));
	return result;
};

export const ReadRoles: Mutations['ReadRoles'] = async ({invoke, mutate, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {roles} = result.value;
	mutate(() => stashRoles(ui, roles));
	return result;
};
