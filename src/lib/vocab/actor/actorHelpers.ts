import {plural} from '@feltjs/util/string.js';
import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {AccountActor, ActionActor, ClientActor, Actor, ActorId} from '$lib/vocab/actor/actor';
import {GHOST_ACTOR_ID} from '$lib/app/constants';

/**
 * Converts a persona name string to its regular form.
 * Used for both persona and hub names.
 * @param name - A persona name that may be invalid
 * @returns The scrubbed value.
 */
export const scrubPersonaName = (name: string): string => name.trim();

export const ACTOR_NAME_CHARACTER_MATCHER = /^[a-z\d-]+$/iu;
// TODO maybe add these to the schema? problem is ajv will return less friendly errors from service calls
const ACTOR_NAME_MAX_LENGTH = 39; // same as github
const ACTOR_NAME_MIN_LENGTH = 3;

/**
 * Checks if a persona name is valid.
 * Used for both persona and hub names.
 * @param name - A persona name that may be invalid
 * @returns `null` if valid, otherwise an error message
 */
export const checkPersonaName = (name: string): string | null => {
	if (name.length > ACTOR_NAME_MAX_LENGTH) {
		return `name must be no longer than ${ACTOR_NAME_MAX_LENGTH} characters`;
	}
	if (name.length < ACTOR_NAME_MIN_LENGTH) {
		return `name must be at least ${ACTOR_NAME_MIN_LENGTH} character${plural(
			ACTOR_NAME_MIN_LENGTH,
		)}`;
	}
	if (!ACTOR_NAME_CHARACTER_MATCHER.test(name)) {
		return 'name must contain only letters, numbers, and hyphens';
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

export const lookupPersona = (
	personaById: Map<ActorId, Readable<ClientActor>>,
	persona_id: ActorId,
): Readable<ClientActor> => personaById.get(persona_id) || personaById.get(GHOST_ACTOR_ID)!;

export const isAccountActor = (
	persona: Actor | ClientActor | ActionActor | undefined | null,
): persona is AccountActor => persona?.type === 'account' && 'hub_id' in persona;
