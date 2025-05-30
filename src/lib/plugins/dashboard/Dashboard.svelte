<script lang="ts">
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';

	import Luggage from '$lib/ui/Luggage.svelte';
	import MainNav from '$lib/ui/MainNav.svelte';
	import SpaceView from '$lib/ui/SpaceView.svelte';
	import Marquee from '$lib/ui/Marquee.svelte';
	import DashboardHeader from '$lib/plugins/dashboard/DashboardHeader.svelte';
	import MarqueeButton from '$lib/ui/MarqueeButton.svelte';
	import {getApp} from '$lib/ui/app.js';
	import SpaceContextmenu from '$lib/ui/SpaceContextmenu.svelte';
	import HubContextmenu from '$lib/ui/HubContextmenu.svelte';
	import CreateAccountActorForm from '$lib/ui/CreateAccountActorForm.svelte';
	import CreateHubForm from '$lib/ui/CreateHubForm.svelte';
	import {getLayoutContext} from '$lib/ui/layout.js';
	import EmptyPath from '$lib/ui/EmptyPath.svelte';

	const {
		actions,
		ui: {contextmenu, expandMarquee},
	} = getApp();

	const layoutContext = getLayoutContext();
	$: ({actor, hub, space} = $layoutContext);
</script>

<Luggage />
<MainNav />
<main
	class="dashboard"
	use:contextmenu.action={[
		actor && hub && space ? to_contextmenu_params(SpaceContextmenu, {actor, hub, space}) : null,
		hub && actor ? to_contextmenu_params(HubContextmenu, {actor, hub}) : null,
	]}
>
	{#if $expandMarquee}
		<div
			aria-hidden
			class="marquee_bg"
			on:click={() => ($expandMarquee ? actions.ToggleSecondaryNav() : null)}
		/>
	{/if}
	<div class="space width_md">
		<DashboardHeader {actor} {space} {hub} />
		<div class="content">
			{#if actor}
				{#if hub}
					{#if space}
						<SpaceView {actor} {hub} {space} />
					{:else}
						<EmptyPath {actor} {hub} />
					{/if}
				{:else}
					<CreateHubForm {actor} />
				{/if}
			{:else}
				<CreateAccountActorForm />
			{/if}
		</div>
		<MarqueeButton />
	</div>
	<!-- TODO extract to some shared abstractions with the `Luggage` probably -->
	{#if $expandMarquee && hub && space}
		<div class="marquee_wrapper">
			<Marquee {hub} {space} />
		</div>
	{/if}
</main>

<style>
	.dashboard {
		height: 100%;
		width: 100%;
		display: flex;
	}
	.content {
		overflow: auto;
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.space {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	/* TODO handle properly for mobile */
	/* TODO better name? */
	.marquee_wrapper {
		position: relative;
		height: 100%;
		width: var(--width_sm);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		background-color: var(--bg);
	}
	/* TODO abstract with `MainNav` at all? */
	.marquee_bg {
		z-index: 3;
		display: none;
		position: fixed;
		inset: 0;
		/* TODO from loom */
		background-color: rgba(0, 0, 0, 0.4);
	}
	:global(.mobile) .marquee_wrapper {
		z-index: 3;
		position: fixed;
		right: 0;
		top: 0;
	}
	:global(.mobile) .marquee_bg {
		display: block;
		animation: fade-in var(--duration_3) ease-out;
	}
</style>
