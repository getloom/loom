<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import Mention from '$lib/plugins/mention/Mention.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let pending = false;
	export let attrs: any = undefined;

	let errorMessage: string | undefined;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $actor.name.toLowerCase();

	const deleteActor = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.DeleteActor({
			actor: $actor.actor_id,
			actor_id: $actor.actor_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
		pending = false;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (!locked) {
				await deleteActor();
			}
		}
	};
</script>

<form class="prose padded_xl" {...attrs}>
	<h2>Delete <Mention name={$actor.name} />?</h2>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
	<input
		type="text"
		name="name"
		placeholder=">enter name to unlock button"
		bind:value={lockText}
		on:keydown={onKeydown}
	/>
	<PendingButton {pending} disabled={locked || pending} on:click={deleteActor}>
		delete actor
	</PendingButton>
</form>
