<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import MemberItem from '$lib/ui/MemberItem.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {getApp} from '$lib/ui/app.js';
	import SocketConnectionControls from '$lib/ui/SocketConnectionControls.svelte';

	const {
		ui: {expandMarquee, actorsByHubId},
		socket,
		devmode,
	} = getApp();

	export let hub: Readable<Hub>;
	export let space: Readable<Space> | null;

	$: communityActors = $actorsByHubId.get($hub.hub_id);
</script>

<div class="marquee">
	{#if communityActors}
		<MarqueeNav {space} {communityActors} />

		<!-- TODO display other meta info about the hub -->
		{#if $expandMarquee}
			<section>
				<ul>
					<!-- TODO probably want these to be sorted so the selected actor is always first -->
					{#each communityActors as actor (actor)}
						<MemberItem {actor} />
					{/each}
				</ul>
			</section>
			{#if $devmode}
				<section>
					<menu>
						<li><a href="/docs">/docs</a></li>
					</menu>
				</section>
				{#if socket}
					<section>
						<SocketConnectionControls {socket} />
					</section>
				{/if}
			{/if}
		{/if}
	{/if}
</div>

<style>
	.marquee {
		width: 100%;
		height: 100%;
		background-color: var(--fg_1);
	}
</style>
