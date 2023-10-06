<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';

	const {
		ui: {actorById},
	} = getApp();

	export let assignment: Assignment;

	$: assignmentActor = lookupActor(actorById, assignment.actor_id);
</script>

<div style:--icon_size="var(--icon_size_xs)">
	<ActorAvatar actor={assignmentActor} />
</div>
