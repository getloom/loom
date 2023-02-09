import type {Result} from '@feltjs/util';
import {toGraphemeCount} from '@feltjs/util/string.js';

import type {Space} from '$lib/vocab/space/space';

export const ICON_MISSING_ERROR = 'please add an icon, any character including emoji';
export const ICON_TOO_LONG_ERROR = 'icon must be exactly 1 character';

// TODO move to schema for server-side validation -- `maxLength` won't work because it uses `.length`
const ICON_MAX_LENGTH = 1;

export const parseSpaceIcon = (value: string): Result<{value: string}, {message: string}> => {
	if (!value) {
		return {ok: false, message: ICON_MISSING_ERROR};
	}
	if (toGraphemeCount(value) > ICON_MAX_LENGTH) {
		return {ok: false, message: ICON_TOO_LONG_ERROR};
	}
	return {ok: true, value};
};

export const isHomeSpace = (space: Space): boolean => space.path === '/';

export const canDeleteSpace = (space: Space): boolean => !isHomeSpace(space);
