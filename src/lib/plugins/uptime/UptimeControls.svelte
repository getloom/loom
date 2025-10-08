<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import UptimeInput from './UptimeInput.svelte';

	export let list: Readable<Entity>;
	export let listInputEl: HTMLTextAreaElement | undefined = undefined;
</script>

<div class="list-controls" transition:slide>
	<slot />
	<UptimeInput {list} bind:el={listInputEl} />
</div>

<style>
	.list-controls {
		--icon_size: var(--icon_size_sm);
		display: flex;
		align-items: center;
		width: 100%;
	}
	/* TODO hacky */
	.list-controls :global(.text-input) {
		flex: 1;
	}
</style>
