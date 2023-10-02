<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@fuz.dev/fuz_library/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();

	export let attrs: any = undefined;

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
		const result = await actions.UpdateAccountPassword({oldPassword, newPassword});
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

	const onKeyDown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await updatePassword();
		}
	};
</script>

<form class="panel prose padded_xl" {...attrs}>
	<fieldset class="box">
		<legend class="width_full text_align_center">change account password</legend>
		<label>
			<div class="title">old password</div>
			<input
				type="password"
				bind:this={oldPasswordEl}
				bind:value={oldPassword}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
				use:autofocus
			/>
		</label>
		<label>
			<div class="title">new password</div>
			<input
				type="password"
				bind:this={passwordEl}
				bind:value={newPassword}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
			/>
		</label>
		<label>
			<div class="title">confirm new password</div>
			<input
				type="password"
				bind:this={password2El}
				bind:value={newPassword2}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
			/>
		</label>
		<p class="box" class:error_text={!!errorMessage} class:success-text={!!successMessage}>
			{errorMessage || successMessage || '🔑'}
		</p>
		<PendingButton pending={!!submitting} bind:el={buttonEl} on:click={updatePassword}
			>change password</PendingButton
		>
	</fieldset>
</form>
