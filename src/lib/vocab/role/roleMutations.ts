import type {Mutations} from '$lib/app/eventTypes';
import {evictRoles, stashRole} from '$lib/vocab/role/roleMutationHelpers';

export const CreateRole: Mutations['CreateRole'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {role: $role} = result.value;
	stashRole(ui, $role);
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateRole: Mutations['UpdateRole'] = async ({invoke, params, ui: {roleById}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const role = roleById.get(params.role_id)!;
	role.update(($role) => ({
		...$role,
		name: params.name,
	}));
	return result;
};

export const DeleteRoles: Mutations['DeleteRoles'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	evictRoles(ui, params.roleIds);
	return result;
};

export const ReadRoles: Mutations['ReadRoles'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//const {roles} = result.value;
	//TODO update stores here
	return result;
};
