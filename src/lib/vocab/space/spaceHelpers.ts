import type {Result} from '@grogarden/util/result.js';
import {to_grapheme_count} from '@grogarden/util/string.js';

import type {Entity} from '$lib/vocab/entity/entity.js';
import type {Space} from '$lib/vocab/space/space.js';

export const ICON_MISSING_ERROR = 'please add an icon, any character including emoji';
export const ICON_TOO_LONG_ERROR = 'icon must be exactly 1 character';

// TODO move to schema for server-side validation -- `maxLength` won't work because it uses `.length`
const ICON_MAX_LENGTH = 1;

export const parseSpaceIcon = (value: string): Result<{value: string}, {message: string}> => {
	if (!value) {
		return {ok: false, message: ICON_MISSING_ERROR};
	}
	if (to_grapheme_count(value) > ICON_MAX_LENGTH) {
		return {ok: false, message: ICON_TOO_LONG_ERROR};
	}
	return {ok: true, value};
};

export const HOME_NAME = 'home';
export const HOME_PATH = `/${HOME_NAME}`;

export const parseDirectoryPath = (urlPath: string): string =>
	urlPath === '/' ? HOME_PATH : urlPath;

export const renderDirectoryPath = (path: string | null | undefined): string | null | undefined =>
	path === HOME_PATH ? '/' : path;

// TODO these are weird, they depend on only the directory but answer questions about the space
export const isHomeDirectory = (directory: Entity): boolean => directory.path === HOME_PATH;

export const canDeleteSpace = (directory: Entity): boolean => !isHomeDirectory(directory);

export const isHomeSpace = (space: Space): boolean => space.name === HOME_NAME;
