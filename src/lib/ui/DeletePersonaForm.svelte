<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Message from '@feltcoop/felt/Message.svelte';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;
	export let pending = false;

	let errorMessage: string | undefined;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $persona.name.toLowerCase();

	const deletePersona = async () => {
		pending = true;
		errorMessage = '';
		const result = await dispatch.DeletePersona({
			actor: $persona.persona_id,
			persona_id: $persona.persona_id,
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
				await deletePersona();
			}
		}
	};
</script>

<form class="markup padded-xl" {...$$restProps}>
	<legend>Delete <strong>@{$persona.name}</strong>?</legend>
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
	<PendingButton {pending} disabled={locked || pending} on:click={deletePersona}>
		delete persona
	</PendingButton>
</form>
