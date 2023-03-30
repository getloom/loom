<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import {getApp} from '$lib/ui/app';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import type {Role} from '$lib/vocab/role/role';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import AssignmentItem from '$lib/ui/AssignmentItem.svelte';
	import AssignmentManager from '$lib/ui/AssignmentManager.svelte';
	import PolicyItem from '$lib/ui/PolicyItem.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import {permissionNames} from '$lib/vocab/policy/permissions';
	import type {DeleteRoleResponseResult} from '$lib/app/actionTypes';

	const {
		actions,
		ui: {assignmentsByRoleId, policiesByRoleId},
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let role: Readable<Role>;
	export let hub: Readable<Hub>;
	export let deleteRole: (role: Readable<Role>) => Promise<DeleteRoleResponseResult>;

	$: assignments = $assignmentsByRoleId.get($role.role_id);
	$: policies = $policiesByRoleId.get($role.role_id);

	let newName = '';

	const updateRole = async () => {
		const name = newName.trim(); // TODO parse to trim? regularize step?
		if (!name) return;
		if (name === $role?.name) return;

		//TODO better error handling
		await actions.UpdateRole({
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
	<section>
		<form>
			<label>
				<div class="title">role name</div>
				<input placeholder={$role.name} on:keydown={onKeydown} bind:value={newName} />
			</label>
			<button
				type="button"
				on:click={() =>
					actions.OpenDialog({
						Component: ConfirmDialog,
						props: {
							confirmed: () => deleteRole(role), // TODO handle displaying any error somehow, this receives the `result`
							promptText: `Delete the role "${$role.name}"?`,
						},
					})}
			>
				delete this role
			</button>
		</form>
	</section>
	<section>
		<h2>Assignments</h2>
		<form>
			<button
				type="button"
				on:click={() =>
					actions.OpenDialog({
						Component: AssignmentManager,
						dialogProps: {layout: 'page'},
						props: {role, hub},
					})}
			>
				assign this role to a persona
			</button>
		</form>
		{#if assignments}
			{#if assignments.length}
				<ul class="assignments">
					{#each assignments as assignment (assignment)}
						<AssignmentItem actor={persona} {assignment} />
					{/each}
				</ul>
			{:else}
				<p>there are no assignments for this role</p>
			{/if}
		{:else}
			<PendingAnimation />
		{/if}
	</section>
	<section>
		<h2>Permissions</h2>
		{#if policies}
			<ul class="policies">
				{#each permissionNames as permission (permission)}
					<PolicyItem actor={persona} {role} {permission} policy={policies.get(permission)} />
				{/each}
			</ul>
		{:else}
			<PendingAnimation />
		{/if}
	</section>
</div>

<style>
	.details {
		padding: var(--spacing_md);
	}

	section {
		margin-bottom: var(--spacing_xl3);
	}

	/* TODO figure this out semantically */
	button {
		margin: var(--spacing_lg) 0;
	}
</style>
