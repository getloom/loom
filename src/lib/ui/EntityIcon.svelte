<script lang="ts">
	import type {EntityType} from '$lib/vocab/entity/entity.schema';

	export let name: string;
	export let icon: string | null = null;
	export let type: EntityType = 'Persona';
	export let inline = false;

	$: squared = type === 'Hub';
</script>

{#if icon}
	<img class="entity-icon" class:squared class:inline src={icon} alt="icon for {name}" />
{:else}
	<span class="entity-icon" class:squared class:inline>{name[0]}</span>
{/if}

<style>
	.entity-icon {
		height: var(--icon_size);
		width: var(--icon_size);
		flex-shrink: 0;
		user-select: none;
	}
	span.entity-icon {
		background-color: hsl(var(--hue), 50%, 50%);
		border-radius: 50%;
		color: white;
		font-weight: 600;
		font-size: calc(var(--icon_size) * 0.38);
		line-height: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
	}
	.entity-icon.inline,
	.entity-icon.inline > :global(*) {
		display: inline-block;
		vertical-align: text-bottom;
	}
	span.entity-icon.inline {
		/* TODO big hack, not sure what to do to center vertically
		as an inline-block without adding another wrapper element, which would be nice to avoid */
		line-height: 2.7;
	}
	/* TODO should these apply to `img` as well? */
	span.squared {
		border-radius: calc(var(--icon_size) / 4);
	}
	span.squared:active {
		border-radius: calc(var(--icon_size) / 4 + 2px);
	}
</style>
