<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {Role} from '$lib/vocab/role/role';
	import type {Persona} from '$lib/vocab/persona/persona';
	import AssignmentItem from '$lib/ui/AssignmentItem.svelte';
	import AssignmentManager from '$lib/ui/AssignmentManager.svelte';
	import type {Community} from '$lib/vocab/community/community';

	const {
		dispatch,
		ui: {assignmentsByRoleId},
	} = getApp();

	export let persona: Readable<Persona>;
	export let role: Readable<Role>;
	export let community: Readable<Community>;
	$: assignments = $assignmentsByRoleId.get($role.role_id);

	let newName = '';

	const updateRole = async () => {
		const name = newName.trim(); // TODO parse to trim? regularize step?
		if (!name) return;
		if (name === $role?.name) return;

		//TODO better error handling
		await dispatch.UpdateRole({
			actor: $persona.persona_id,
			role_id: $role.role_id,
			name,
		});

		newName = '';
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			await updateRole();
		}
	};
</script>

<div class="details">
	<div class="actions">
		<button
			title="delete role"
			on:click={() =>
				dispatch.OpenDialog({
					Component: ConfirmDialog,
					props: {
						action: () =>
							dispatch.DeleteRole({
								actor: $persona.persona_id,
								role_id: $role.role_id,
							}),
						promptText: 'Are you sure you want to delete this role?',
					},
				})}>🗑️</button
		>
		<input placeholder={$role.name} on:keydown={onKeydown} bind:value={newName} />
	</div>
	<h2>Manage Role Assignments</h2>
	<button
		on:click={() =>
			dispatch.OpenDialog({
				Component: AssignmentManager,
				dialogProps: {layout: 'page'},
				props: {
					role,
					community,
				},
			})}>Assign Role</button
	>
	<div class="assignments">
		{#if assignments}
			{#each assignments as assignment (assignment)}
				<AssignmentItem actor={persona} {assignment} />
			{/each}
		{/if}
	</div>
	<h2>Permissions</h2>
	[list of toggles goes here]
</div>

<style>
	.details {
		padding: var(--spacing_md);
		flex: 2;
		background-color: rgba(0, 0, 0, 0.45);
	}
</style>
