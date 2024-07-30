<script lang="ts">
	// TODO extract to Loom
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';
</script>

<div class="pending-animation-overlay">
	<Pending_Animation />
</div>

<style>
	.pending-animation-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: var(--size_7);
	}
</style>
