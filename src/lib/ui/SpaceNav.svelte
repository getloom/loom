<script lang="ts">
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import SpaceNavItem from '$lib/ui/SpaceNavItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {getApp} from '$lib/ui/app.js';
	import HubContextmenu from '$lib/ui/HubContextmenu.svelte';

	const {
		ui: {contextmenu},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let spaces: Array<Readable<Space>>;
	export let selectedSpace: Readable<Space> | null;
</script>

<nav class="space-nav" use:contextmenu.action={to_contextmenu_params(HubContextmenu, {actor, hub})}>
	{#each spaces as space (space)}
		<SpaceNavItem {actor} {hub} {space} selected={space === selectedSpace} />
	{/each}
</nav>

<style>
	.space-nav {
		--icon_size: var(--icon_size_sm);
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
		position: sticky;
		top: var(--navbar_size);
	}
</style>
