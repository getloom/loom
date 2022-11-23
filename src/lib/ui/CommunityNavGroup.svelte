<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import CommunityNavItem from '$lib/ui/CommunityNavItem.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {getApp} from '$lib/ui/app';
	import ActingPersonaContextmenu from '$lib/app/contextmenu/ActingPersonaContextmenu.svelte';

	const {
		ui: {personaSelection, communitySelection, communitiesBySessionPersona, contextmenu},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedCommunity = $communitySelection;

	export let persona: Readable<AccountPersona>; // session persona

	$: personalCommunity = $communitiesBySessionPersona
		.get(persona)
		?.find((c) => c.get().type === 'personal');

	$: standardCommunities = $communitiesBySessionPersona
		.get(persona)
		?.filter((c) => c.get().type !== 'personal');
</script>

{#if personalCommunity && standardCommunities}
	<div class="persona-group" use:contextmenu.action={[[ActingPersonaContextmenu, {persona}]]}>
		<CommunityNavItem
			community={personalCommunity}
			{persona}
			selected={persona === selectedPersona && personalCommunity === selectedCommunity}
		/>
		{#each standardCommunities as community (community)}
			<CommunityNavItem
				{community}
				{persona}
				selected={persona === selectedPersona && community === selectedCommunity}
			/>
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
