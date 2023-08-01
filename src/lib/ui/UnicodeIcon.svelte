<script lang="ts">
	export let icon: string;
	export let title: string | undefined = undefined;
	export let iconAttrs: any = undefined;
</script>

<div {title} aria-label={title} {...iconAttrs}>{icon}</div>

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
