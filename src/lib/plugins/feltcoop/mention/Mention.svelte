<script lang="ts">
	import type {ContextmenuActionParams} from '@feltjs/felt-ui';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';

	const {
		ui: {actors, hubs},
	} = getApp();

	const {actor} = getSpaceContext();

	export let name: string;
	export let contextmenuParams: ContextmenuActionParams | null | undefined = undefined;
	export let inline = true;

	// TODO maybe add a cache of actor by name
	$: hub = Array.from($hubs.value).find((c) => c.get().name === name);
	$: mentionedActor = Array.from($actors.value).find((p) => p.get().name === name);
</script>

<span class="mention" class:inline>
	{#if mentionedActor && hub && $mentionedActor?.type === 'community'}
		<HubAvatar {actor} {hub} {contextmenuParams} {inline}>@</HubAvatar>
	{:else if mentionedActor}
		<ActorAvatar actor={mentionedActor} {contextmenuParams} {inline}>@</ActorAvatar>
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
