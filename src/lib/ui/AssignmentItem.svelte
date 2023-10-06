<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';

	const {
		actions,
		ui: {actorById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let assignment: Assignment;

	$: assignmentActor = lookupActor(actorById, assignment.actor_id);

	const deleteAssignment = async () => {
		//TODO better error handling
		await actions.DeleteAssignment({
			actor: $actor.actor_id,
			assignment_id: assignment.assignment_id,
		});
	};
</script>

<li class="assignment-item">
	<ActorAvatar actor={assignmentActor} showIcon={false} />
	<button class="icon_button plain" on:click={() => deleteAssignment()}> ✕ </button>
</li>

<style>
	.assignment-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--spacing_1);
		background-color: var(--fg_0);
	}
	.assignment-item:hover {
		background-color: var(--fg_1);
	}
</style>
