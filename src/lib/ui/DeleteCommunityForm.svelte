<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Message from '@feltcoop/felt/Message.svelte';

	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;

	let errorMessage: string | undefined;
	let pending = false;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $community.name.toLowerCase();

	const deleteCommunity = async () => {
		pending = true;
		errorMessage = '';
		const result = await dispatch.DeleteCommunity({
			actor: $persona.persona_id,
			community_id: $community.community_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
		pending = false;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (!locked) {
				await deleteCommunity();
			}
		}
	};
</script>

<form class="markup padded-xl" {...$$restProps}>
	<h2>Delete Community?</h2>
	<ContextInfo {persona} {community} />
	<label>
		<div class="title">community name</div>
		<input type="text" name="name" placeholder=">" bind:value={lockText} on:keydown={onKeydown} />
		<p>enter the community name to unlock the delete button</p>
	</label>
	<PendingButton {pending} disabled={locked || pending} on:click={deleteCommunity}>
		delete community
	</PendingButton>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</form>
