<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import AssignmentInputItem from '$lib/ui/AssignmentInputItem.svelte';
	import {getApp} from '$lib/ui/app';

	import type {Role} from '$lib/vocab/role/role';
	import type {Community} from '$lib/vocab/community/community';

	const {
		ui: {personaSelection, personasByCommunityId, assignmentsByRoleId},
	} = getApp();

	export let role: Readable<Role>;
	export let community: Readable<Community>;

	$: assignments = $assignmentsByRoleId.get($role.role_id)!;

	$: selectedPersona = $personaSelection;

	$: communityPersonas = $personasByCommunityId.get($role.community_id)!;

	// TODO speed this up with a better cached data structures
	$: assignablePersonas = communityPersonas.filter(
		(p) =>
			!assignments.some(
				(a) => a.persona_id === p.get().persona_id && a.community_id === $community.community_id,
			),
	);
</script>

<div class="padded-xl">
	<h1>Assign the role "{$role.name}" to:</h1>
	{#if selectedPersona}
		<menu>
			{#each assignablePersonas as persona (persona)}
				<AssignmentInputItem
					persona={selectedPersona}
					assignmentPersona={persona}
					{community}
					{role}
				/>
			{:else}
				<p>There's no one new to assign this role to</p>
			{/each}
		</menu>
	{/if}
</div>
