<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

	const {dispatch} = getApp();

	export let username = '';
	let password = '';
	let password2 = '';
	let usernameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let password2El: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !!submitting;

	const signUp = async () => {
		if (submitting) return;
		username = scrubAccountName(username);
		if (!username) {
			usernameEl.focus();
			errorMessage = 'please enter an email address';
			return;
		}
		const usernameErrorMessage = checkAccountName(username);
		if (usernameErrorMessage) {
			usernameEl.focus();
			errorMessage = usernameErrorMessage;
			return;
		}
		if (!password) {
			passwordEl.focus();
			errorMessage = 'please enter a password';
			return;
		}
		if (!password2) {
			password2El.focus();
			errorMessage = 'please confirm the password';
			return;
		}
		if (password !== password2) {
			passwordEl.focus();
			errorMessage = 'passwords do not match';
			return;
		}
		buttonEl.focus();
		submitting = true;
		errorMessage = '';
		const result = await dispatch.SignUp({username, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			usernameEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeypress = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await signUp();
		}
	};
</script>

<div class="icon">
	<img src="/favicon.png" alt="felt heart" />
</div>
<form>
	<input
		bind:this={usernameEl}
		bind:value={username}
		on:keypress={onKeypress}
		{disabled}
		placeholder="email"
		use:autofocus
		autocomplete="username"
	/>
	<input
		type="password"
		bind:this={passwordEl}
		bind:value={password}
		on:keypress={onKeypress}
		{disabled}
		placeholder="password"
	/>
	<input
		type="password"
		bind:this={password2El}
		bind:value={password2}
		on:keypress={onKeypress}
		{disabled}
		placeholder="confirm password"
	/>
	<PendingButton pending={!!submitting} bind:el={buttonEl} on:click={signUp}>sign up</PendingButton>
	<div class:error-text={!!errorMessage}>{errorMessage || '💚'}</div>
</form>
<div class="centered-block">
	<div>
		<slot />
	</div>
</div>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.icon {
		display: flex;
		justify-content: center;
		padding: var(--spacing_lg);
	}
	.icon img {
		width: var(--icon_size);
		height: var(--icon_size);
	}
	.centered-block {
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
