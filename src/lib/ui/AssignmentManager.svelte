<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import AssignmentInputItem from '$lib/ui/AssignmentInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	import type {Role} from '$lib/vocab/role/role';
	import type {Hub} from '$lib/vocab/hub/hub';

	const {
		ui: {personaSelection, personasByHubId, assignmentsByRoleId},
	} = getApp();

	export let role: Readable<Role>;
	export let hub: Readable<Hub>;

	$: assignments = $assignmentsByRoleId.get($role.role_id)!;

	$: selectedPersona = $personaSelection;

	$: hubPersonas = $personasByHubId.get($role.hub_id)!;

	// TODO speed this up with a better cached data structures
	$: assignablePersonas = hubPersonas.filter(
		(p) =>
			!assignments.some((a) => a.persona_id === p.get().persona_id && a.hub_id === $hub.hub_id),
	);
</script>

<div class="padded-xl">
	<h1>Assign the role "{$role.name}" to:</h1>
	{#if selectedPersona}
		<menu>
			{#each assignablePersonas as persona (persona)}
				<AssignmentInputItem persona={selectedPersona} assignmentPersona={persona} {hub} {role} />
			{:else}
				<p>There's no one new to assign this role to</p>
			{/each}
		</menu>
	{/if}
</div>
