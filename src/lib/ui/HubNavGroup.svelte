<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import HubNavItem from '$lib/ui/HubNavItem.svelte';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import {getApp} from '$lib/ui/app';
	import ActingActorContextmenu from '$lib/app/contextmenu/ActingActorContextmenu.svelte';

	const {
		ui: {personaSelection, hubSelection, hubsBySessionPersona, contextmenu},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedHub = $hubSelection;

	export let persona: Readable<AccountPersona>; // session persona

	$: personalHub = $hubsBySessionPersona.get(persona)?.find((c) => c.get().type === 'personal');

	$: communityHubs = $hubsBySessionPersona.get(persona)?.filter((c) => c.get().type !== 'personal');
</script>

{#if personalHub && communityHubs}
	<div class="persona-group" use:contextmenu.action={[[ActingActorContextmenu, {persona}]]}>
		<HubNavItem
			hub={personalHub}
			{persona}
			selected={persona === selectedPersona && personalHub === selectedHub}
		/>
		{#each communityHubs as hub (hub)}
			<HubNavItem {hub} {persona} selected={persona === selectedPersona && hub === selectedHub} />
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
