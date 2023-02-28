import {PERSONA_NAME_CHARACTER_MATCHER} from '$lib/vocab/persona/personaHelpers';

// TODO misses a lot of cases, need a regexp or proper parsing
export const isPathValid = (p: string): boolean => {
	const parts = p.split('/').filter(Boolean);
	if (!parts.length) return false;
	for (const part of parts) {
		if (!PERSONA_NAME_CHARACTER_MATCHER.test(part)) return false;
	}
	return true;
};

export const isNetworkRelativePath = (p: string): boolean => p.startsWith('//') && p[2] !== '/';
export const isNetworkRelativePathValid = (_p: string): boolean => true; // TODO hmm - any chars? escaping?

export const isHubRelativePath = (p: string): boolean => p.startsWith('/') && p[1] !== '/';
export const isHubRelativePathValid = isPathValid;

export const isSpaceRelativePath = (p: string): boolean => p.startsWith('./') && p[2] !== '/';
export const isSpaceRelativePathValid = (p: string): boolean => isPathValid(p.substring(2));
