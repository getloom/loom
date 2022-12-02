import {PERSONA_NAME_CHARACTER_MATCHER} from '$lib/vocab/persona/personaHelpers';

export const isAbsolutePathValid = (p: string): boolean =>
	PERSONA_NAME_CHARACTER_MATCHER.test(p.split('/')[1]);
