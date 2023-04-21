<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import HubNavItem from '$lib/ui/HubNavItem.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {getApp} from '$lib/ui/app';
	import ActingActorContextmenu from '$lib/app/contextmenu/ActingActorContextmenu.svelte';

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
	<div class="hub-nav-group" use:contextmenu.action={[[ActingActorContextmenu, {actor}]]}>
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
