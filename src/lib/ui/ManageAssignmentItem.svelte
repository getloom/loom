<script lang="ts">
	import Message from '@feltcoop/felt/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;

	let errorMessage: string | undefined;
	let pending = false;

	const leaveCommunity = async (community_id: number) => {
		errorMessage = '';
		pending = true;
		const result = await dispatch.LeaveCommunity({
			actor: $persona.persona_id,
			community_id,
		});
		pending = false;
		if (!result.ok) {
			errorMessage = result.message;
		}
	};
</script>

<li>
	<div class="row">
		<CommunityAvatar {community} />
		{#if $community.type === 'personal'}
			<button disabled>🏠</button>
		{:else}
			<PendingButton {pending} on:click={() => leaveCommunity($community.community_id)}>
				👋
			</PendingButton>
		{/if}
	</div>
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{/if}
</li>

<style>
	.row {
		font-size: var(--font_size_xl);
		justify-content: space-between;
	}
</style>
