<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {autofocus} from '$lib/ui/actions';
	import HeroIcon from '$lib/ui/HeroIcon.svelte';
	import {getApp} from '$lib/ui/app';
	import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

	const {dispatch} = getApp();

	export let username = '';
	let password = '';
	let usernameEl: HTMLInputElement;
	let passwordEl: HTMLInputElement;
	let buttonEl: HTMLButtonElement;
	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !!submitting;

	const signIn = async () => {
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
		buttonEl.focus();
		submitting = true;
		errorMessage = '';
		const result = await dispatch.SignIn({username, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			passwordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeypress = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await signIn();
		}
	};
</script>

<HeroIcon />
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
		autocomplete="current-password"
	/>
	<PendingButton pending={!!submitting} bind:el={buttonEl} on:click={signIn}>sign in</PendingButton>
	<div class:error-text={!!errorMessage}>{errorMessage || '💚'}</div>
</form>
<slot />

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
