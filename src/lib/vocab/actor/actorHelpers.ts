import {plural} from '@grogarden/util/string.js';
import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {
	AccountActor,
	ActionActor,
	ClientActor,
	Actor,
	ActorId,
} from '$lib/vocab/actor/actor.js';
import {GHOST_ACTOR_ID} from '$lib/util/constants.js';

/**
 * Converts a actor name string to its regular form.
 * Used for both actor and hub names.
 * @param name - A actor name that may be invalid
 * @returns The scrubbed value.
 */
export const scrubActorName = (name: string): string => name.trim();

/**
 * Same restrictions as Mastodon.
 */
export const ACTOR_NAME_CHARACTER_MATCHER = /^[a-z\d_]+$/iu;
const ACTOR_NAME_MAX_LENGTH = 30;
const ACTOR_NAME_MIN_LENGTH = 1;

/**
 * Checks if a actor name is valid.
 * Used for both actor and hub names.
 * @param name - A actor name that may be invalid
 * @returns `null` if valid, otherwise an error message
 */
export const checkActorName = (name: string): string | null => {
	if (name.length > ACTOR_NAME_MAX_LENGTH) {
		return `name must be no longer than ${ACTOR_NAME_MAX_LENGTH} characters`;
	}
	if (name.length < ACTOR_NAME_MIN_LENGTH) {
		return `name must be at least ${ACTOR_NAME_MIN_LENGTH} character${plural(
			ACTOR_NAME_MIN_LENGTH,
		)}`;
	}
	if (!ACTOR_NAME_CHARACTER_MATCHER.test(name)) {
		return 'name must contain only letters, numbers, and underscores';
	}
	if (name.includes('__')) {
		return 'name must not contain consecutive underscores';
	}
	if (name[0] === '_') {
		return 'name must not start with a underscore';
	}
	if (name[name.length - 1] === '_') {
		return 'name must not end with a underscore';
	}
	return null;
};

export const lookupActor = (
	actorById: Map<ActorId, Readable<ClientActor>>,
	actor_id: ActorId | undefined,
): Readable<ClientActor> => (actor_id && actorById.get(actor_id)) || actorById.get(GHOST_ACTOR_ID)!;

export const isAccountActor = (
	actor: Actor | ClientActor | ActionActor | undefined | null,
): actor is AccountActor => actor?.type === 'account' && 'hub_id' in actor;
