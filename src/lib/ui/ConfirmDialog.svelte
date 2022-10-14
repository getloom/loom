<script lang="ts">
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import Message from '@feltcoop/felt/ui/Message.svelte';

	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let action: (() => any) | undefined = undefined;
	export let promptText = 'Are you sure?';
	export let confirmText = 'Confirm';
	export let cancelText = 'Cancel';

	let pending = false;
	let errorMessage: string | undefined;

	const confirm = async () => {
		let result = action?.();
		if (result && 'then' in result) {
			pending = true;
			errorMessage = undefined;
			result = await result;
			pending = false;
			if (result && 'ok' in result && !result.ok) {
				errorMessage = result.message || 'unknown error';
				return;
			}
		}
		close();
	};

	const close = () => {
		if (done) {
			done();
		} else {
			dispatch.CloseDialog();
		}
	};
</script>

<div class="markup padded-xl">
	<h1>{promptText}</h1>
	<div class="buttons">
		<button on:click={close}>{cancelText}</button>
		<PendingButton {pending} on:click={confirm}>{confirmText}</PendingButton>
	</div>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</div>
