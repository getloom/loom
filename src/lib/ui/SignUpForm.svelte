<script lang="ts">
	import {tick} from 'svelte';
	import {PUBLIC_INSTANCE_ICON} from '$env/static/public';
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import {swallow} from '@grogarden/util/dom.js';

	import {autofocus} from '$lib/ui/actions.js';
	import HeroIcon from '$lib/ui/HeroIcon.svelte';
	import {getApp} from '$lib/ui/app.js';
	import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers.js';

	const {actions} = getApp();

	export let username = '';
	export let attrs: any = undefined;

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
		const result = await actions.SignUp({username, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			usernameEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeyDown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			swallow(e);
			await signUp();
		}
	};
</script>

<HeroIcon />
<form {...attrs}>
	<fieldset>
		<label>
			<div class="title">email</div>
			<input
				bind:this={usernameEl}
				bind:value={username}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
				use:autofocus
				autocomplete="username"
			/></label
		>
		<label>
			<div class="title">password</div>
			<input
				type="password"
				bind:this={passwordEl}
				bind:value={password}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
			/></label
		>
		<label>
			<div class="title">confirm password</div>
			<input
				type="password"
				bind:this={password2El}
				bind:value={password2}
				on:keydown={onKeyDown}
				{disabled}
				placeholder=">"
			/>
		</label>
		<Pending_Button pending={!!submitting} bind:el={buttonEl} on:click={signUp}
			>sign up</Pending_Button
		>
		<p class:error_text={!!errorMessage}>{errorMessage || PUBLIC_INSTANCE_ICON}</p>
		<slot />
	</fieldset>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	fieldset {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
