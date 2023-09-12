<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import Alert from '@feltjs/felt-ui/Alert.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let communityActor: Readable<ClientActor>;

	let errorMessage: string | null = null;

	let kickPending = false;
	const kickActorFromHub = async () => {
		kickPending = true;
		const result = await actions.KickFromHub({
			actor: $actor.actor_id,
			actor_id: $communityActor.actor_id,
			hub_id: $hub.hub_id,
		});
		if (result.ok) {
			errorMessage = null;
		} else {
			errorMessage = result.message;
		}
		kickPending = false;
	};
</script>

<li class="actor-item">
	<ActorAvatar actor={communityActor} showIcon={true} />
	<PendingButton
		title="kick actor"
		attrs={{class: 'icon_button plain'}}
		on:click={() =>
			actions.OpenDialog(
				toDialogParams(ConfirmDialog, {
					confirmed: kickActorFromHub,
					promptText: `Kick ${$communityActor.name} from ${$hub.name}? This cannot be reversed.`,
					confirmText: 'kick them',
				}),
			)}
		pending={kickPending}
	>
		✕
	</PendingButton>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</li>

<style>
	.actor-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--spacing_xl);
		background-color: var(--fg_0);
	}
	.actor-item:hover {
		background-color: var(--fg_1);
	}
</style>
