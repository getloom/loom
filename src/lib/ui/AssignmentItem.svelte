<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		actions,
		ui: {personaById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let assignment: Assignment;

	$: assignmentActor = lookupActor(personaById, assignment.actor_id);

	const deleteAssignment = async () => {
		//TODO better error handling
		await actions.DeleteAssignment({
			actor: $actor.actor_id,
			assignment_id: assignment.assignment_id,
		});
	};
</script>

<li class="assignment-item">
	<ActorAvatar persona={assignmentActor} showIcon={false} />
	<button class="icon-button plain-button" on:click={() => deleteAssignment()}> ✕ </button>
</li>

<style>
	.assignment-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-left: var(--spacing_xl);
		background-color: var(--tint_dark_0);
	}
	.assignment-item:hover {
		background-color: var(--tint_dark_1);
	}
</style>
