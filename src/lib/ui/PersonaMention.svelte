<script lang="ts">
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import CommunityContextmenu from '$lib/app/contextmenu/CommunityContextmenu.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {personas, contextmenu, communities},
	} = getApp();

	export let name: string;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;

	// TODO maybe add a cache of persona by name
	$: community = $communities.value.find((c) => c.get().name === name);
	$: persona = $personas.value.find((p) => p.get().name === name);
</script>

{#if community && $persona?.type === 'community'}
	<span
		class="mention"
		use:contextmenu.action={contextmenuAction || [[CommunityContextmenu, {community, persona}]]}
	>
		@{name}
	</span>
{:else if persona}
	<span
		class="mention"
		use:contextmenu.action={contextmenuAction || [[PersonaContextmenu, {persona}]]}
	>
		@{name}
	</span>
{:else}
	@{name}
{/if}

<style>
	.mention {
		font-weight: bold;
	}
</style>
