<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Message from '@feltjs/felt-ui/Message.svelte';

	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	const {actions} = getApp();

	export let hub: Readable<Hub>;
	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;
	let pending = false;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $hub.name.toLowerCase();

	const leaveHub = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.LeaveHub({
			actor: $persona.persona_id,
			persona_id: $persona.persona_id,
			hub_id: $hub.hub_id,
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
				await leaveHub();
			}
		}
	};
</script>

<form class="markup padded-xl" {...$$restProps}>
	<h2>Leave Hub?</h2>
	<ContextInfo {persona} {hub} />
	<label>
		<div class="title">hub name</div>
		<input type="text" name="name" placeholder=">" bind:value={lockText} on:keydown={onKeydown} />
		<p>enter the hub name to unlock the leave button</p>
	</label>
	<PendingButton {pending} disabled={locked || pending} on:click={leaveHub}>
		leave hub
	</PendingButton>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</form>
