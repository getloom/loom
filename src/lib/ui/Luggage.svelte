<script lang="ts">
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();
</script>

<div class="luggage">
	<button
		class="icon_button plain"
		title="toggle luggage"
		aria-label="toggle luggage"
		on:click={() => actions.ToggleMainNav()}
	>
		<span>☰</span>
	</button>
</div>

<style>
	.luggage {
		--icon_size: var(--luggage_size);
		z-index: 3;
		position: absolute;
		left: 0;
		top: 0;
	}
	button {
		height: var(--navbar_size);
		min-height: var(--navbar_size);
		border-radius: 0;
	}
	button:active span {
		transform: scale3d(1.16, 1.16, 1.16);
	}
</style>
