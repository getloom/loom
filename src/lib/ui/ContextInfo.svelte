<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceName from '$lib/ui/SpaceName.svelte';

	export let actor: Readable<AccountActor> | null = null;
	export let hub: Readable<Hub> | null = null;
	export let space: Readable<Space> | null = null;
</script>

<div class="context-info">
	{#if space && actor && hub}
		<div class="row" style:font-size="var(--size_xl)">
			<SpaceName {space} />
		</div>
	{/if}
	{#if actor && hub}
		<div class="row">
			<span class="spaced_hz">in</span>
			<HubAvatar {actor} {hub} />
		</div>
	{/if}
	{#if actor}
		<div class="row">
			<span class="spaced_hz">as</span>
			<ActorAvatar {actor} />
		</div>
	{/if}
</div>

<style>
	.context-info {
		--icon_size: var(--icon_size_sm);
		margin-bottom: var(--spacing_lg);
	}
	.row {
		margin-bottom: var(--spacing_sm);
	}
	.row:last-child {
		margin-bottom: 0;
	}
</style>
