<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {personaById},
	} = getApp();

	export let assignment: Assignment;

	$: assignmentPersona = lookupPersona(personaById, assignment.persona_id);
</script>

<div style:--icon_size="var(--icon_size_xs)">
	<ActorAvatar persona={assignmentPersona} />
</div>
