<script lang="ts">
	import {tick} from 'svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {swallow} from '@feltjs/util/dom.js';
	import {dev} from '$app/environment';
	import {PUBLIC_ADMIN_ICON} from '$env/static/public';

	import {autofocus} from '$lib/ui/actions';
	import HeroIcon from '$lib/ui/HeroIcon.svelte';
	import {getApp} from '$lib/ui/app';
	import {checkAccountName, scrubAccountName} from '$lib/vocab/account/accountHelpers';

	const {actions} = getApp();

	export let username = '';
	let password = dev ? 'a' : '';
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
		const result = await actions.SignIn({username, password});
		submitting = false;
		if (!result.ok) {
			errorMessage = result.message;
			await tick();
			passwordEl.select(); // wait a tick to let the DOM update (the input is disabled when fetching)
		}
	};

	const onKeyDown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			swallow(e);
			await signIn();
		}
	};
</script>

<HeroIcon />
<form {...$$restProps}>
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
				autocomplete="current-password"
			/></label
		>
		<div class="box">
			<PendingButton pending={!!submitting} bind:el={buttonEl} on:click={signIn}
				>sign in</PendingButton
			>
			<p class:error-text={!!errorMessage}>{errorMessage || PUBLIC_ADMIN_ICON}</p>
			<slot />
		</div>
	</fieldset>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	/* TODO make this into a utility class? */
	.box {
		width: 100%;
	}
</style>
