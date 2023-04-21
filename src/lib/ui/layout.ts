import type {Readable} from '@feltcoop/svelte-gettable-stores';

import type {Entity} from '$lib/vocab/entity/entity';
import type {Hub} from '$lib/vocab/hub/hub';
import type {AccountActor} from '$lib/vocab/actor/actor';
import type {Space} from '$lib/vocab/space/space';
import {getContext, setContext} from 'svelte';

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
