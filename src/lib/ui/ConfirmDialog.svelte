<script lang="ts">
	import PendingButton from '@fuz.dev/fuz_library/PendingButton.svelte';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import {onMount} from 'svelte';

	import {getApp} from '$lib/ui/app.js';

	const {actions} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let confirmed: (() => any) | undefined = undefined;
	export let promptText = 'Are you sure?';
	export let confirmText = 'confirm';
	export let cancelText = 'cancel';

	let pending = false;
	let errorMessage: string | undefined;

	const confirm = async () => {
		let result = confirmed?.();
		if (result) {
			errorMessage = undefined;
			if ('then' in result) {
				pending = true;
				result = await result;
				pending = false;
			}
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
			actions.CloseDialog();
		}
	};

	let cancelButtonEl: HTMLButtonElement;
	onMount(() => {
		cancelButtonEl.focus();
	});
</script>

<div class="padded_1">
	<div class="prose">
		<h1>{promptText}</h1>
	</div>
	<!-- TODO a11y -->
	<div class="buttons">
		<button on:click={close} bind:this={cancelButtonEl}>{cancelText}</button>
		<PendingButton {pending} on:click={confirm}>{confirmText}</PendingButton>
	</div>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</div>
