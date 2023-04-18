<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import MemberItem from '$lib/ui/MemberItem.svelte';
	import MarqueeNav from '$lib/ui/MarqueeNav.svelte';
	import {getApp} from '$lib/ui/app';
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

{#if communityActors}
	<MarqueeNav {space} {communityActors} />

	<!-- TODO display other meta info about the hub -->
	{#if $expandMarquee}
		<section>
			<ul>
				<!-- TODO probably want these to be sorted so the selected persona is always first -->
				{#each communityActors as persona (persona)}
					<MemberItem {persona} />
				{/each}
			</ul>
		</section>
		{#if $devmode}
			<section>
				<menu>
					<li><a href="/docs">/docs</a></li>
				</menu>
			</section>
			<section>
				<SocketConnectionControls {socket} />
			</section>
		{/if}
	{/if}
{/if}
