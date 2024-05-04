<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';

	import HubNavItem from '$lib/ui/HubNavItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {getApp} from '$lib/ui/app.js';
	import ActingActorContextmenu from '$lib/ui/ActingActorContextmenu.svelte';

	const {
		ui: {actorSelection, hubSelection, hubsBySessionActor, contextmenu},
	} = getApp();

	$: selectedActor = $actorSelection!;
	$: selectedHub = $hubSelection;

	export let actor: Readable<AccountActor>; // session actor

	$: personalHub = $hubsBySessionActor.get(actor)?.find((c) => c.get().type === 'personal');

	$: communityHubs = $hubsBySessionActor.get(actor)?.filter((c) => c.get().type !== 'personal');
</script>

{#if personalHub && communityHubs}
	<div
		class="hub-nav-group"
		use:contextmenu.action={to_contextmenu_params(ActingActorContextmenu, {actor})}
	>
		<HubNavItem
			hub={personalHub}
			{actor}
			selected={actor === selectedActor && personalHub === selectedHub}
		/>
		{#each communityHubs as hub (hub)}
			<HubNavItem {hub} {actor} selected={actor === selectedActor && hub === selectedHub} />
		{/each}
	</div>
{/if}

<style>
	.hub-nav-group {
		width: 100%;
		margin-bottom: var(--navbar_size);
	}
	.hub-nav-group:last-child {
		margin-bottom: 0;
	}
</style>
