<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';

	import type {Role} from '$lib/vocab/role/role';
	import type {Persona} from '$lib/vocab/persona/persona';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let role: Readable<Role>;

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
			on:click={() =>
				dispatch.OpenDialog({
					Component: ConfirmDialog,
					props: {
						done: () => dispatch.CloseDialog(),
						action: () =>
							dispatch.DeleteRole({
								actor: $persona.persona_id,
								role_id: $role.role_id,
							}),
						description: 'delete this role',
					},
				})}>🗑️</button
		>
		<input placeholder={$role.name} on:keydown={onKeydown} bind:value={newName} />
	</div>
	<h2>Manage Members</h2>
	[list of members with role goes here]
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
