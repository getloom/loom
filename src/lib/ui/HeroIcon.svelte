<script lang="ts">
	export let alt = 'green felt heart';
</script>

<div class="icon">
	<img src="/favicon.png" {alt} />
</div>

<style>
	.icon {
		display: flex;
		justify-content: center;
		padding: var(--spacing_lg);
	}
	.icon img {
		width: var(--icon_size);
		height: var(--icon_size);
	}
</style>
