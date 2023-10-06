<script lang="ts">
	import HubNav from '$lib/ui/HubNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {randomHue} from '$lib/util/color.js';
	import {toName} from '$lib/vocab/entity/entityHelpers.js';

	const {
		actions,
		ui: {expandMainNav, spaceSelection, actorSelection, hubSelection, spacesByHubId},
	} = getApp();

	$: selectedActor = $actorSelection!;
	$: selectedHub = $hubSelection;
	$: selectedSpace = $spaceSelection;

	// TODO refactor once hub data is normalized
	$: selectedHubSpaces = selectedHub && $spacesByHubId.get($selectedHub!.hub_id);

	// TODO refactor to some client view-model for the account
	$: hue = randomHue(toName($selectedActor));
</script>

{#if $expandMainNav}
	<div
		aria-hidden
		class="main_nav_bg"
		on:click={() => ($expandMainNav ? actions.ToggleMainNav() : null)}
	/>
{/if}
<div class="main_nav_panel" class:expanded={$expandMainNav} style="--hue: {hue}">
	<div class="main_nav">
		<div class="header">
			<div class="luggage_placeholder" />
			<div class="explorer_button">
				<ActorAvatar actor={selectedActor} />
			</div>
		</div>
		<div class="explorer">
			<HubNav />
			{#if selectedActor && selectedHub && selectedHubSpaces}
				<SpaceNav
					actor={selectedActor}
					hub={selectedHub}
					spaces={selectedHubSpaces}
					{selectedSpace}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.main_nav_panel {
		width: 0;
		transition: width var(--duration_1) ease-out;
	}
	.main_nav_panel.expanded {
		width: var(--width_sm);
		transition-duration: var(--duration_2);
	}
	.main_nav {
		position: relative;
		z-index: 2;
		height: 100%;
		width: var(--width_sm);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		transform-origin: top left;
		background-color: var(--bg);
		transform: translate3d(-100%, 0, 0);
		transition: transform var(--duration_1) ease-out;
	}
	.expanded .main_nav {
		transform: translate3d(0, 0, 0);
		transition-duration: var(--duration_2);
	}
	.main_nav_bg {
		z-index: 2;
		display: none;
		position: fixed;
		inset: 0;
		/* TODO from felt */
		background-color: rgba(0, 0, 0, 0.4);
	}
	:global(.mobile) .main_nav {
		position: fixed;
		left: 0;
		top: 0;
	}
	:global(.mobile) .main_nav_bg {
		display: block;
		animation: fade-in var(--duration_3) ease-out;
	}
	:global(.mobile) .main_nav_panel.expanded {
		width: 0;
	}
	.header {
		background-color: var(--fg_1);
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		width: 100%;
	}
	.luggage_placeholder {
		width: var(--luggage_size);
		height: var(--navbar_size);
		flex-shrink: 0;
	}
	.explorer {
		background-color: var(--fg_1);
		display: flex;
		flex: 1;
		align-items: flex-start;
	}
	.explorer_button {
		--icon_size: var(--icon_size_sm);
		justify-content: flex-start;
		display: flex;
		align-items: center;
		flex: 1;
		padding-left: var(--spacing_xs);
	}
</style>
