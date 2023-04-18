<script lang="ts">
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';
	import {getApp} from '$lib/ui/app';

	const {
		ui: {actors, hubs},
	} = getApp();

	export let name: string;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;
	export let inline = true;

	// TODO maybe add a cache of persona by name
	$: hub = Array.from($hubs.value).find((c) => c.get().name === name);
	$: persona = Array.from($actors.value).find((p) => p.get().name === name);
</script>

<span class="mention" class:inline>
	{#if hub && $persona?.type === 'community'}
		<HubAvatar {hub} {contextmenuAction} {inline}>@</HubAvatar>
	{:else if persona}
		<ActorAvatar {persona} {contextmenuAction} {inline}>@</ActorAvatar>
	{:else}
		@{name}
	{/if}
</span>

<style>
	.mention {
		--icon_size: var(--mention_icon_size, var(--icon_size_xs));
		display: flex;
		align-items: center;
	}
	.mention.inline {
		display: inline;
		white-space: nowrap;
		/* TODO might need to max-width this and `text-overflow: ellipsis;` */
	}
</style>
