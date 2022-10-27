<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	let oldPassword = '';
	let newPassword = '';
	let newPassword2 = '';
	let oldPasswordEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let password2El: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let successMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !!submitting;

	const updatePassword = async () => {
		if (submitting) return;
		errorMessage = undefined;
		successMessage = undefined;
		if (!oldPassword) {
			oldPasswordEl.focus();
			errorMessage = 'please enter your current password';
			return;
		}
		if (!newPassword) {
			passwordEl.focus();
			errorMessage = 'please enter a new password';
			return;
		}
		if (!newPassword2) {
			password2El.focus();
			errorMessage = 'please confirm the new password';
			return;
		}
		if (newPassword !== newPassword2) {
			passwordEl.focus();
			errorMessage = 'new passwords do not match';
			return;
		}
		if (newPassword === oldPassword) {
			passwordEl.focus();
			errorMessage = 'new password is the same as the old one';
			return;
		}
		buttonEl.focus();
		submitting = true;
		const result = await dispatch.UpdateAccountPassword({oldPassword, newPassword});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			oldPasswordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		} else {
			successMessage = 'successfully updated password';
			oldPassword = '';
			newPassword = '';
			newPassword2 = '';
		}
	};

	const onKeypress = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await updatePassword();
		}
	};
</script>

<form class="panel">
	<PendingButton pending={!!submitting} bind:el={buttonEl} on:click={updatePassword}
		>change password</PendingButton
	>
	<div class="status" class:error-text={!!errorMessage} class:success-text={!!successMessage}>
		{errorMessage || successMessage || '🔑'}
	</div>
	<label
		>old password
		<input
			type="password"
			bind:this={oldPasswordEl}
			bind:value={oldPassword}
			on:keypress={onKeypress}
			{disabled}
			placeholder=">"
			use:autofocus
		/>
	</label>
	<label
		>new password
		<input
			type="password"
			bind:this={passwordEl}
			bind:value={newPassword}
			on:keypress={onKeypress}
			{disabled}
			placeholder=">"
		/>
	</label>
	<label
		>confirm new password
		<input
			type="password"
			bind:this={password2El}
			bind:value={newPassword2}
			on:keypress={onKeypress}
			{disabled}
			placeholder=">"
		/>
	</label>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: var(--spacing_sm);
	}
	.status {
		margin: var(--spacing_sm) 0;
	}
	label:not(:last-child) {
		margin-bottom: var(--spacing_sm);
	}
</style>
