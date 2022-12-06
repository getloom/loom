<script lang="ts">
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {personas, communities},
	} = getApp();

	export let name: string;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;
	export let inline = true;

	// TODO maybe add a cache of persona by name
	$: community = Array.from($communities.value).find((c) => c.get().name === name);
	$: persona = Array.from($personas.value).find((p) => p.get().name === name);
</script>

<span class="mention" class:inline>
	{#if community && $persona?.type === 'community'}
		<CommunityAvatar {community} {contextmenuAction} {inline}>@</CommunityAvatar>
	{:else if persona}
		<PersonaAvatar {persona} {contextmenuAction} {inline}>@</PersonaAvatar>
	{:else}
		@{name}
	{/if}
</span>

<style>
	.mention {
		--icon_size: var(--icon_size_xs);
		display: flex;
		align-items: center;
	}
	.mention.inline {
		display: inline;
		white-space: nowrap;
		/* TODO might need to max-width this and `text-overflow: ellipsis;` */
	}
</style>
