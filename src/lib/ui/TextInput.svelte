<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {autofocus as autofocusAction} from '$lib/ui/actions.js';

	const dispatch = createEventDispatcher<{submit: string}>();

	export let actor: Readable<AccountActor>;
	export let value = '';
	export let placeholder: string | undefined = undefined;
	export let el: HTMLTextAreaElement | undefined = undefined;
	export let autofocus = false;
	export let attrs: any = undefined;

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			dispatch('submit', value);
		}
	};

	$: finalAutofocusAction = autofocus ? autofocusAction : Function.prototype;
</script>

<div class="text_input">
	<ActorAvatar {actor} showName={false} />
	<textarea
		{placeholder}
		on:keydown={onKeydown}
		bind:value
		bind:this={el}
		use:finalAutofocusAction
		{...attrs}
	/>
</div>

<style>
	.text_input {
		display: flex;
		width: 100%;
		padding: var(--spacing_xs);
	}
	textarea {
		margin-left: var(--spacing_xs);
	}
</style>
