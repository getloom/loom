<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	const dispatcher = createEventDispatcher<{submit: string}>();

	export let persona: Readable<Persona>;
	export let value = '';

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			dispatcher('submit', value);
		}
	};
</script>

<div class="text-input">
	<PersonaAvatar {persona} showName={false} />
	<textarea on:keydown={onKeydown} bind:value {...$$restProps} />
</div>

<style>
	.text-input {
		display: flex;
		padding: var(--spacing_xs);
	}
	textarea {
		margin-left: var(--spacing_xs);
	}
</style>
