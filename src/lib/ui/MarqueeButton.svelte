<script lang="ts">
	import {getApp} from '$lib/ui/app.js';

	const {
		actions,
		ui: {expandMarquee},
	} = getApp();

	const marquee_width = 320; // TODO where to get this?
	$: right = $expandMarquee ? marquee_width : 0;
</script>

<button
	class="plain icon_button"
	class:expanded={$expandMarquee}
	style="transform: translate3d({right}px, 0, 0)"
	title="toggle marquee"
	aria-label="toggle marquee"
	on:click={() => actions.ToggleSecondaryNav()}
>
	<div class="content">⚆</div>
</button>

<style>
	button {
		z-index: 1;
		position: absolute;
		right: 0;
		top: 0;
		border-radius: 0;
		/* TODO this is janky because it can go offscreen for a bit,
		though it's a nice idea because it maintains object permanence */
		/* transition: transform var(--duration_1) ease-out; */
		--icon_size: var(--navbar_size);
	}
	.content {
		transition: transform var(--duration_4) ease-in-out;
		transform: rotate(0deg);
	}
	.expanded .content {
		transform: rotate(180deg);
	}
	:global(.mobile) button {
		transform: translate3d(0, 0, 0) !important;
	}
	:global(.mobile) button.expanded {
		z-index: 4;
	}
</style>
