<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {slide} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity.js';	
	import IncomeInput from './IncomeInput.svelte';

	export let income: Readable<Entity> | undefined;
    export let incomePath: string;
	export let incomeInputEl: HTMLTextAreaElement | undefined = undefined;
</script>

<div class="list-controls" transition:slide>
	<slot />
	<IncomeInput {incomePath} entity={income} bind:el={incomeInputEl} />
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