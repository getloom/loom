<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		actions,
		ui: {personaById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let assignment: Assignment;

	$: assignmentPersona = lookupPersona(personaById, assignment.persona_id);

	const deleteAssignment = async () => {
		//TODO better error handling
		await actions.DeleteAssignment({
			actor: $actor.persona_id,
			assignment_id: assignment.assignment_id,
		});
	};
</script>

<li class="assignment-item">
	<ActorAvatar persona={assignmentPersona} showIcon={false} />
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
