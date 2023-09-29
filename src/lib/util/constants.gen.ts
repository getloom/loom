import type {Gen} from '@grogarden/gro/gen.js';
import {load_package_json} from '@grogarden/gro/package_json.js';
import {to_root_path} from '@grogarden/gro/paths.js';

export const gen: Gen = async ({origin_id}) => {
	const package_json = await load_package_json();

	return `
// generated by ${to_root_path(origin_id)}

export const DEFAULT_PAGE_SIZE = 20;

// TODO test these values from the database
export const ADMIN_HUB_NAME = 'admin';
export const ADMIN_HUB_ID = 1;
export const ADMIN_ACTOR_ID = 1;
export const GHOST_ACTOR_NAME = 'ghost';
export const GHOST_ACTOR_ID = 2;

export const GUEST_ACTOR_NAME = 'guest';

export const VERSION = ${JSON.stringify(package_json.version)};

// generated by ${to_root_path(origin_id)}
	`;
};
