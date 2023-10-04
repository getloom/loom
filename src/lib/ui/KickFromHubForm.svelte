<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingAnimation from '@fuz.dev/fuz_library/PendingAnimation.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import KickActorItem from '$lib/ui/KickActorItem.svelte';

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;

	const {
		ui: {actorsByHubId},
	} = getApp();

	$: communityActors = $actorsByHubId.get($hub.hub_id);
</script>

<div class="prose padded_1">
	<h1>Kicking From Hub</h1>
	<ContextInfo {actor} {hub} />
</div>
<div class="content panel">
	{#if communityActors}
		<ul class="details-wrapper">
			{#each communityActors as communityActor (communityActor)}
				<KickActorItem {actor} {hub} {communityActor} />
			{/each}
		</ul>
	{:else}
		<PendingAnimation />
	{/if}
</div>

<style>
	.content {
		display: flex;
	}

	.details-wrapper {
		flex: 1;
	}
</style>
