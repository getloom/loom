<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor, ClientActor} from '$lib/vocab/actor/actor.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Role} from '$lib/vocab/role/role.js';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let assignmentActor: Readable<ClientActor>;
	export let hub: Readable<Hub>;
	export let role: Readable<Role>;

	const createAssignment = async () => {
		await actions.CreateAssignment({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			actor_id: $assignmentActor.actor_id,
			role_id: $role.role_id,
		});
	};
</script>

<li>
	<button type="button" on:click={() => createAssignment()}>
		<ActorAvatar actor={assignmentActor} />
	</button>
</li>

<style>
	button {
		width: 100%;
		justify-content: flex-start;
	}
</style>
