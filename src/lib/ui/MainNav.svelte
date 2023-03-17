<script lang="ts">
	import HubNav from '$lib/ui/HubNav.svelte';
	import SpaceNav from '$lib/ui/SpaceNav.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import {randomHue} from '$lib/ui/color';
	import {toName} from '$lib/vocab/entity/entityHelpers';

	const {
		actions,
		ui: {expandMainNav, spaceSelection, personaSelection, hubSelection, spacesByHubId},
	} = getApp();

	$: selectedPersona = $personaSelection!;
	$: selectedHub = $hubSelection;
	$: selectedSpace = $spaceSelection;

	// TODO refactor once hub data is normalized
	$: selectedHubSpaces = selectedHub && $spacesByHubId.get($selectedHub!.hub_id);

	// TODO refactor to some client view-model for the account
	$: hue = randomHue(toName($selectedPersona));
</script>

{#if $expandMainNav}
	<div
		aria-hidden
		class="main-nav-bg"
		on:click={() => ($expandMainNav ? actions.ToggleMainNav() : null)}
	/>
{/if}
<div class="main-nav-panel" class:expanded={$expandMainNav} style="--hue: {hue}">
	<div class="main-nav">
		<div class="header">
			<div class="luggage-placeholder" />
			<div class="explorer-button">
				<PersonaAvatar persona={selectedPersona} />
			</div>
		</div>
		<div class="explorer">
			<HubNav />
			{#if selectedPersona && selectedHub && selectedHubSpaces}
				<SpaceNav
					persona={selectedPersona}
					hub={selectedHub}
					spaces={selectedHubSpaces}
					{selectedSpace}
				/>
			{/if}
		</div>
	</div>
</div>

<style>
	.main-nav-panel {
		width: 0;
	}
	.main-nav-panel.expanded {
		width: var(--column_width_sm);
	}
	.main-nav {
		position: relative;
		z-index: 2;
		height: 100%;
		width: var(--column_width_sm);
		overflow: auto;
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		transform-origin: top left;
		background-color: var(--tint_light);
		transform: translate3d(-100%, 0, 0) scale3d(1, 1, 1);
		transition: transform var(--duration_1) ease-out;
	}
	.expanded .main-nav {
		transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
		transition-duration: var(--duration_2);
	}
	.main-nav-bg {
		z-index: 2;
		display: none;
		position: fixed;
		inset: 0;
		/* TODO from felt */
		background-color: rgba(0, 0, 0, 0.4);
	}
	:global(.mobile) .main-nav {
		position: fixed;
		left: 0;
		top: 0;
	}
	:global(.mobile) .main-nav-bg {
		display: block;
		animation: fade-in var(--duration_3) ease-out;
	}
	:global(.mobile) .main-nav-panel.expanded {
		width: 0;
	}
	.header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		width: 100%;
		background-color: var(--tint_light);
	}
	.luggage-placeholder {
		width: var(--luggage_size);
		height: var(--navbar_size);
		flex-shrink: 0;
	}
	.explorer {
		display: flex;
		flex: 1;
		align-items: flex-start;
	}
	.explorer-button {
		--icon_size: var(--icon_size_sm);
		justify-content: flex-start;
		display: flex;
		align-items: center;
		flex: 1;
		padding-left: var(--spacing_xs);
	}
</style>
