import type {Readable} from '@getloom/svelte-gettable-stores';
import {getContext, setContext} from 'svelte';

import type {Entity} from '$lib/vocab/entity/entity.js';
import type {Hub} from '$lib/vocab/hub/hub.js';
import type {AccountActor} from '$lib/vocab/actor/actor.js';
import type {Space} from '$lib/vocab/space/space.js';

export interface LayoutContext {
	actor: Readable<AccountActor> | null;
	hub: Readable<Hub> | null;
	space: Readable<Space> | null;
	directory: Readable<Entity> | null;
}

const KEY = Symbol('LayoutContext');

export const getLayoutContext = (): Readable<LayoutContext> => getContext(KEY);

export const setLayoutContext = (ctx: Readable<LayoutContext>): Readable<LayoutContext> =>
	setContext(KEY, ctx);
