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

	export let persona: Readable<AccountActor>; // session persona

	$: personalHub = $hubsBySessionActor.get(persona)?.find((c) => c.get().type === 'personal');

	$: communityHubs = $hubsBySessionActor.get(persona)?.filter((c) => c.get().type !== 'personal');
</script>

{#if personalHub && communityHubs}
	<div class="persona-group" use:contextmenu.action={[[ActingActorContextmenu, {persona}]]}>
		<HubNavItem
			hub={personalHub}
			{persona}
			selected={persona === selectedActor && personalHub === selectedHub}
		/>
		{#each communityHubs as hub (hub)}
			<HubNavItem {hub} {persona} selected={persona === selectedActor && hub === selectedHub} />
		{/each}
	</div>
{/if}

<style>
	.persona-group {
		width: 100%;
		margin-bottom: var(--navbar_size);
	}
	.persona-group:last-child {
		margin-bottom: 0;
	}
</style>
