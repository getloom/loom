<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import BudgetItemInput from './BudgetInput.svelte';

	export let list: Readable<Entity>;
	export let categoryInputEl: HTMLTextAreaElement | undefined = undefined;
	export let valueInputEl: HTMLTextAreaElement | undefined = undefined;
</script>

<div class="list-controls" transition:slide>
	<slot />
	<BudgetItemInput {list} bind:el1={categoryInputEl} bind:el2={valueInputEl} />
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
