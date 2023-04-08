<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {personaById},
	} = getApp();

	export let assignment: Assignment;

	$: assignmentActor = lookupActor(personaById, assignment.persona_id);
</script>

<div style:--icon_size="var(--icon_size_xs)">
	<ActorAvatar persona={assignmentActor} />
</div>
