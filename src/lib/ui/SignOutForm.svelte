<script lang="ts">
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';
	import Message from '@feltcoop/felt/Message.svelte';
	import type {SignOutResponseResult} from '$lib/app/eventTypes';

	import type {ClientAccount} from '$lib/vocab/account/accountHelpers';
	import {getApp} from '$lib/ui/app';

	const {
		dispatch,
		ui: {session},
	} = getApp();

	let account: ClientAccount | undefined;
	$: account = $session.guest ? undefined : $session.account;

	let errorMessage: string | undefined;
	let submitting: boolean | undefined;

	$: disabled = !account;

	const signOut = async (): Promise<SignOutResponseResult> => {
		submitting = true;
		errorMessage = '';
		const result = await dispatch.SignOut();
		if (!result.ok) {
			errorMessage = result.message;
		}
		submitting = false;
		return result;
	};
</script>

<form {...$$restProps}>
	<PendingButton pending={!!submitting} on:click={signOut} {disabled}>sign out</PendingButton>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
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
