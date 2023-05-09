<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {toDialogData} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let communityActor: Readable<ClientActor>;

	let kickPending = false;
	const kickActorFromHub = async () => {
		kickPending = true;
		await actions.KickFromHub({
			actor: $actor.actor_id,
			actor_id: $communityActor.actor_id,
			hub_id: $hub.hub_id,
		});
		kickPending = false;
	};
</script>

<li class="actor-item">
	<ActorAvatar actor={communityActor} showIcon={true} />
	<PendingButton
		title="kick actor"
		class="icon-button plain-button"
		on:click={() =>
			actions.OpenDialog(
				toDialogData(ConfirmDialog, {
					confirmed: kickActorFromHub,
					promptText: `Kick ${$communityActor.name} from ${$hub.name}? This cannot be reversed.`,
					confirmText: 'kick them',
				}),
			)}
		pending={kickPending}
	>
		✕
	</PendingButton>
</li>

<style>
	.actor-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--spacing_xl);
		background-color: var(--tint_dark_0);
	}
	.actor-item:hover {
		background-color: var(--tint_dark_1);
	}
</style>
