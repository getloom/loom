<script lang="ts">
	import {createEventDispatcher} from 'svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	const dispatch = createEventDispatcher<{submit: string}>();

	export let persona: Readable<AccountActor>;
	export let value = '';
	export let el: HTMLTextAreaElement | undefined = undefined;

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			dispatch('submit', value);
		}
	};
</script>

<div class="text-input">
	<ActorAvatar {persona} showName={false} />
	<textarea on:keydown={onKeydown} bind:value {...$$restProps} bind:this={el} />
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
