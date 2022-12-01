import type {SvelteComponent} from 'svelte';

import {views} from '$lib/app/views';
import Link from '$lib/ui/Link.svelte';
import PersonaMention from '$lib/ui/PersonaMention.svelte';

// The collection of components that can be dynamically mounted by the app.

// TODO refactor this to load these components on demand,
// instead of preloading the entire component library

export const components: {[key: string]: typeof SvelteComponent} = {
	...views,
	Link,
	PersonaMention,
};
