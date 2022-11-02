<script lang="ts">
	export let icon: string;
	export let title: string | undefined = undefined;
</script>

<div {title} aria-label={title} {...$$restProps}>{icon}</div>

<style>
	div {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: var(--icon_size);
		height: var(--icon_size);
	}
</style>
