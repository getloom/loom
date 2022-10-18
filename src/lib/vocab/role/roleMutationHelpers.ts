import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';
import {removeUnordered} from '@feltcoop/felt/util/array.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Role} from '$lib/vocab/role/role';
import {Mutated} from '$lib/util/Mutated';

const log = new Logger('[roleMutationHelpers]');

export const stashRoles = (
	ui: WritableUi,
	$roles: Role[],
	mutated = new Mutated('stashRoles'),
	replace = false,
): void => {
	const {roleById, roles} = ui;
	if (replace) {
		roleById.clear();
		roles.get().value.length = 0;
		mutated.add(roles);
	}
	for (const $role of $roles) {
		const {role_id} = $role;
		let role = roleById.get(role_id);
		if (role) {
			role.set($role);
		} else {
			role = writable($role);
			roleById.set(role_id, role);
			roles.get().value.push(role);
			mutated.add(roles);
		}
	}
	mutated.end('stashRoles');
};

export const evictRoles = (
	ui: WritableUi,
	roleIds: number[],
	mutated = new Mutated('evictRoles'),
): void => {
	const {roles, roleById} = ui;

	for (const role_id of roleIds) {
		log.trace('evicting role', role_id);

		const role = roleById.get(role_id);
		if (!role) continue;

		roleById.delete(role_id);

		removeUnordered(roles.get().value, roles.get().value.indexOf(role));
		mutated.add(roles);
	}

	mutated.end('evictRoles');
};
