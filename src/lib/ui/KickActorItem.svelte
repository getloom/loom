<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';

	const {actions} = getApp();

	export let persona: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let communityActor: Readable<ClientActor>;

	let kickPending = false;
	const kickActorFromHub = async () => {
		kickPending = true;
		await actions.KickFromHub({
			actor: $persona.persona_id,
			actor_id: $communityActor.persona_id,
			hub_id: $hub.hub_id,
		});
		kickPending = false;
	};
</script>

<li class="actor-item">
	<ActorAvatar persona={communityActor} showIcon={true} />
	<PendingButton
		title="kick actor"
		class="icon-button plain-button"
		on:click={() =>
			actions.OpenDialog({
				Component: ConfirmDialog,
				props: {
					confirmed: kickActorFromHub,
					promptText: `Kick ${$communityActor.name} from ${$hub.name}? This cannot be reversed.`,
					confirmText: 'kick them',
				},
			})}
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
