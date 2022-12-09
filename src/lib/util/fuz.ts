import {PERSONA_NAME_CHARACTER_MATCHER} from '$lib/vocab/persona/personaHelpers';

// Absolute paths are community-relative,
// similar to how links work in markdown documents on GitHub repos.
export const COMMUNITY_RELATIVE_PATH_PREFIX = '/';
export const SPACE_RELATIVE_PATH_PREFIX = './';

export const isCommunityRelativePath = (p: string): boolean =>
	p.startsWith(COMMUNITY_RELATIVE_PATH_PREFIX);

export const isSpaceRelativePath = (p: string): boolean => p.startsWith(SPACE_RELATIVE_PATH_PREFIX);

// TODO misses a lot of cases, need a regexp or proper parsing
export const isPathValid = (p: string): boolean => {
	const parts = p.split('/').filter(Boolean);
	if (!parts.length) return false;
	for (const part of parts) {
		if (!PERSONA_NAME_CHARACTER_MATCHER.test(part)) return false;
	}
	return true;
};

export const isCommunityRelativePathValid = isPathValid;

export const isSpaceRelativePathValid = (p: string): boolean =>
	isPathValid(p.substring(SPACE_RELATIVE_PATH_PREFIX.length));
