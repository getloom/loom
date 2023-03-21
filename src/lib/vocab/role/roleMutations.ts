import type {Mutations} from '$lib/app/actionTypes';
import {evictRoles, stashRoles} from '$lib/vocab/role/roleMutationHelpers';

export const CreateRole: Mutations['CreateRole'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {role} = result.value;
	ui.mutate(() => stashRoles(ui, [role]));
	return result;
};

export const UpdateRole: Mutations['UpdateRole'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {role} = result.value;
	ui.mutate(() => stashRoles(ui, [role]));
	return result;
};

export const DeleteRole: Mutations['DeleteRole'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	ui.mutate(() => evictRoles(ui, [params.role_id]));
	return result;
};

export const ReadRoles: Mutations['ReadRoles'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {roles} = result.value;
	ui.mutate(() => stashRoles(ui, roles));
	return result;
};
