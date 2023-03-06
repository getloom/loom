import type {Readable} from '@feltcoop/svelte-gettable-stores';

import {GUEST_ACTOR_NAME} from '$lib/vocab/persona/constants';
import type {Entity} from '$lib/vocab/entity/entity';

export const toName = (entity: null | undefined | {name?: string}): string =>
	entity?.name ?? GUEST_ACTOR_NAME;

export const toIcon = (entity: null | undefined | {icon?: string}): string | null =>
	entity?.icon ?? null;

// TODO generic sort helpers -- maybe we want abstractions
// with with cached+sorted views of arrays with splice insertion for efficiency
export const sortEntitiesByCreated = (entities: Array<Readable<Entity>>): Array<Readable<Entity>> =>
	entities.sort((a, b) => (a.get().created > b.get().created ? 1 : -1));
