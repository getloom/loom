<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {ClientActor} from '$lib/vocab/actor/actor.js';
	import type {Space} from '$lib/vocab/space/space.js';

	export let space: Readable<Space> | null;
	export let communityActors: Array<Readable<ClientActor>>;
</script>

<div class="marquee-nav">
	{#if $space}<span class="icon">{$space.icon}</span>{/if}
	{#if communityActors.length > 1}{communityActors.length}{/if}
</div>

<style>
	.marquee-nav {
		position: relative;
		display: flex;
		align-items: center;
		height: var(--navbar_size);
		padding-right: var(--navbar_size); /* placeholder for button, which is rendered elsewhere */
		padding-left: var(--spacing_md);
	}
	.icon {
		font-size: var(--size_lg);
		padding-right: var(--spacing_md);
	}
</style>
