<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import AssignmentInputItem from '$lib/ui/AssignmentInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	import type {Role} from '$lib/vocab/role/role';
	import type {Hub} from '$lib/vocab/hub/hub';

	const {
		ui: {actorSelection, actorsByHubId, assignmentsByRoleId},
	} = getApp();

	export let role: Readable<Role>;
	export let hub: Readable<Hub>;

	$: assignments = $assignmentsByRoleId.get($role.role_id)!;

	$: selectedActor = $actorSelection;

	$: hubActors = $actorsByHubId.get($role.hub_id)!;

	// TODO speed this up with a better cached data structures
	$: assignableActors = hubActors.filter(
		(p) => !assignments.some((a) => a.actor_id === p.get().actor_id && a.hub_id === $hub.hub_id),
	);
</script>

<div class="padded_1">
	<h1>Assign the role "{$role.name}" to:</h1>
	{#if selectedActor}
		<menu>
			{#each assignableActors as actor (actor)}
				<AssignmentInputItem actor={selectedActor} assignmentActor={actor} {hub} {role} />
			{:else}
				<p>There's no one new to assign this role to</p>
			{/each}
		</menu>
	{/if}
</div>
