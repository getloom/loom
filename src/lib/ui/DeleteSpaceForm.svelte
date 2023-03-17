<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {actions} = getApp();

	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;
	export let pending = false;

	let errorMessage: string | undefined;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $space.name.toLowerCase();

	const deleteSpace = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.DeleteSpace({
			actor: $persona.persona_id,
			space_id: $space.space_id,
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
				await deleteSpace();
			}
		}
	};
</script>

<div class="markup padded-xl">
	<form {...$$restProps}>
		<h2>Delete Space?</h2>
		<ContextInfo {persona} {hub} {space} />
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
		<PendingButton {pending} disabled={locked || pending} on:click={deleteSpace}>
			delete space
		</PendingButton>
	</form>
</div>
