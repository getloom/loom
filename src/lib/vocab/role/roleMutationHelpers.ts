import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltjs/util/log.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Role} from '$lib/vocab/role/role';
import {setIfUpdated} from '$lib/util/store';

const log = new Logger('[roleMutationHelpers]');

export const stashRoles = (ui: WritableUi, $rolesToStash: Role[], replace = false): void => {
	const {roleById, roles} = ui;
	if (replace) {
		roleById.clear();
		roles.mutate((r) => r.clear());
	}
	const $roles = roles.get().value;
	let mutated = false;
	for (const $role of $rolesToStash) {
		const {role_id} = $role;
		let role = roleById.get(role_id);
		if (role) {
			setIfUpdated(role, $role);
		} else {
			role = writable($role);
			roleById.set(role_id, role);
			$roles.add(role);
			mutated = true;
		}
	}
	if (mutated) roles.mutate();
};

export const evictRoles = (ui: WritableUi, roleIds: number[]): void => {
	const {roles, roleById} = ui;
	const $roles = roles.get().value;
	let mutated = false;
	for (const role_id of roleIds) {
		log.trace('evicting role', role_id);
		const role = roleById.get(role_id);
		if (!role) continue;
		roleById.delete(role_id);
		$roles.delete(role);
		mutated = true;
	}
	if (mutated) roles.mutate();
};
