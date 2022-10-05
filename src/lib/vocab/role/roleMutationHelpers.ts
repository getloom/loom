import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {WritableUi} from '$lib/ui/ui';
import type {Role} from '$lib/vocab/role/role';
import {removeUnordered} from '@feltcoop/felt/util/array.js';

const log = new Logger('[roleMutationHelpers]');

export const stashRole = (ui: WritableUi, $role: Role): void => {
	log.trace('stashing role', $role.role_id);
	const {roleById, roles} = ui;
	const {role_id} = $role;
	let role = roleById.get(role_id);
	if (role) {
		role.set($role);
	} else {
		role = writable($role);
		roleById.set(role_id, role);
		roles.mutate(($v) => $v.push(role!));
	}
};

export const evictRoles = (ui: WritableUi, roleIds: number[]): void => {
	const {roles, roleById} = ui;

	roleIds.forEach((role_id) => {
		log.trace('evicting role', role_id);

		const role = roleById.get(role_id)!;

		roleById.delete(role_id);
		roles.mutate(($roles) => {
			removeUnordered($roles, $roles.indexOf(role));
		});
	});
};
