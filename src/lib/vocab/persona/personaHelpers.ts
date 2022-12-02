import {plural} from '@feltcoop/util/string.js';

/**
 * Converts a persona name string to its regular form.
 * Used for both persona and community names.
 * @param name
 * @returns The scrubbed value.
 */
export const scrubPersonaName = (name: string): string => name.trim();

export const PERSONA_NAME_CHARACTER_MATCHER = /^[a-z\d-]+$/iu;
// TODO maybe add these to the schema? problem is ajv will return less friendly errors from service calls
const PERSONA_NAME_MAX_LENGTH = 39; // same as github
const PERSONA_NAME_MIN_LENGTH = 3;

/**
 * Checks if a persona name is valid.
 * Used for both persona and community names.
 * @param name
 * @returns `null` if valid, otherwise an error message
 */
export const checkPersonaName = (name: string): string | null => {
	if (name.length > PERSONA_NAME_MAX_LENGTH) {
		return `name must be no longer than ${PERSONA_NAME_MAX_LENGTH} characters`;
	}
	if (name.length < PERSONA_NAME_MIN_LENGTH) {
		return `name must be at least ${PERSONA_NAME_MIN_LENGTH} character${plural(
			PERSONA_NAME_MIN_LENGTH,
		)}`;
	}
	if (!PERSONA_NAME_CHARACTER_MATCHER.test(name)) {
		return 'name must contain only letters, numbers, and hypens';
	}
	if (name.includes('--')) {
		return 'name must not contain consecutive hyphens';
	}
	if (name.startsWith('-')) {
		return 'name must not start with a hyphen';
	}
	if (name.endsWith('-')) {
		return 'name must not end with a hyphen';
	}
	return null;
};
