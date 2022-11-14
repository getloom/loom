<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	const {
		dispatch,
		ui: {personaById},
	} = getApp();

	export let actor: Readable<AccountPersona>;
	export let assignment: Assignment;

	$: assignmentPersona = personaById.get(assignment.persona_id)!;

	const deleteAssignment = async () => {
		//TODO better error handling
		await dispatch.DeleteAssignment({
			actor: $actor.persona_id,
			assignment_id: assignment.assignment_id,
		});
	};
</script>

<div class="assignment-item">
	<button on:click={() => deleteAssignment()}>❌</button><PersonaAvatar
		persona={assignmentPersona}
		showIcon={false}
	/>
</div>
