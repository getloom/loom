<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {AsyncStatus} from '@feltcoop/util/async.js';
	import {tick} from 'svelte';

	import type {Community} from '$lib/vocab/community/community.js';
	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {autofocus} from '$lib/ui/actions';
	import Message from '@feltcoop/felt/Message.svelte';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	const invite = async () => {
		if (!name) {
			errorMessage = 'please enter the name of the person to invite';
			nameEl.focus();
			return;
		}
		status = 'pending';
		const result = await dispatch.InviteToCommunity({
			actor: $persona.persona_id,
			community_id: $community.community_id,
			name,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			done?.(); // TODO instead of closing, maybe show a success message and 2 buttons, invite more and OK
		} else {
			errorMessage = result.message;
			await tick(); // needed because the input is disabled while pending, but maybe it shouldn't be
			nameEl.focus();
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await invite();
		}
	};
</script>

<form {...$$restProps} class="markup padded-xl">
	<legend>Invite to Community</legend>
	<ContextInfo {persona} {community} />
	<fieldset>
		<label>
			<div class="title">persona name to invite</div>
			<input
				placeholder=">"
				bind:this={nameEl}
				bind:value={name}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/></label
		>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<PendingButton on:click={invite} pending={status === 'pending'}>invite</PendingButton>
	</fieldset>
</form>
