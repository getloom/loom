<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import {getApp} from '$lib/ui/app.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

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
	<Pending_Button
		title="kick actor"
		attrs={{class: 'icon_button plain'}}
		on:click={() =>
			actions.OpenDialog(
				to_dialog_params(ConfirmDialog, {
					confirmed: kickActorFromHub,
					promptText: `Kick ${$communityActor.name} from ${$hub.name}? This cannot be reversed.`,
					confirmText: 'kick them',
				}),
			)}
		pending={kickPending}
	>
		✕
	</Pending_Button>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</li>

<style>
	.actor-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--spacing_1);
		background-color: var(--fg_0);
	}
	.actor-item:hover {
		background-color: var(--fg_1);
	}
</style>
