import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltjs/util/log.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Role} from '$lib/vocab/role/role';
import {Mutated} from '$lib/util/Mutated';
import {setIfUpdated} from '$lib/util/store';

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
		roles.get().value.clear();
		mutated.add(roles);
	}
	for (const $role of $roles) {
		const {role_id} = $role;
		let role = roleById.get(role_id);
		if (role) {
			setIfUpdated(role, $role);
		} else {
			role = writable($role);
			roleById.set(role_id, role);
			roles.get().value.add(role);
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

		roles.get().value.delete(role);
		mutated.add(roles);
	}

	mutated.end('evictRoles');
};
