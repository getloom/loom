<script lang="ts">
	export let alt = 'word loom, woven together in motley color';
</script>

<div class="icon">
	<img src="/felt.png" {alt} />
</div>

<style>
	.icon {
		display: flex;
		justify-content: center;
		padding: var(--spacing_lg);
	}
	.icon img {
		width: var(--icon_size_2);
		height: var(--icon_size_2);
	}
</style>
