<script lang="ts">
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import type {SignOutResponseResult} from '$lib/vocab/action/actionTypes.js';

	import type {ClientAccount} from '$lib/vocab/account/account.js';
	import {getApp} from '$lib/ui/app.js';

	const {
		actions,
		ui: {session},
	} = getApp();

	export let attrs: any = undefined;

	let account: ClientAccount | undefined;
	$: account = $session.guest ? undefined : $session.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const signOut = async (): Promise<SignOutResponseResult> => {
		submitting = true;
		errorMessage = '';
		const result = await actions.SignOut();
		if (!result.ok) {
			errorMessage = result.message;
		}
		submitting = false;
		return result;
	};
</script>

<form {...attrs}>
	<Pending_Button pending={!!submitting} on:click={signOut} {disabled}>sign out</Pending_Button>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</form>

<style>
	/*  TODO global classes? */
	form {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
