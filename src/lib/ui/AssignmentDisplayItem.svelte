<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import {lookupPersona} from '$lib/vocab/persona/personaHelpers';

	const {
		ui: {personaById},
	} = getApp();

	export let assignment: Assignment;

	$: assignmentPersona = lookupPersona(personaById, assignment.persona_id);
</script>

<div style:--icon_size="var(--icon_size_xs)">
	<PersonaAvatar persona={assignmentPersona} />
</div>
