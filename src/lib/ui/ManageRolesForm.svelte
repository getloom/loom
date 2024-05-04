<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import ManageRolesItem from '$lib/ui/ManageRolesItem.svelte';
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import Pending_Animation from '@ryanatkn/fuz/Pending_Animation.svelte';
	import type {Role} from '$lib/vocab/role/role.js';
	import RoleDetails from '$lib/ui/RoleDetails.svelte';
	import type {DeleteRoleResponseResult} from '$lib/vocab/action/actionTypes.js';

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;

	$: defaultRoleId = $hub.settings.defaultRoleId;

	const {
		actions,
		ui: {rolesByHubId, roleById},
	} = getApp();

	$: roles = $rolesByHubId.get($hub.hub_id);

	const createRole = async () => {
		//TODO better error handling
		const result = await actions.CreateRole({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			name: 'new role',
		});
		if (result.ok) {
			const role = roleById.get(result.value.role.role_id);
			if (role) selectedRole = role;
		}
	};

	let selectedRole: Readable<Role> | null = null as any;
	const selectRole = (role: Readable<Role>) => {
		selectedRole = role;
	};
	$: if (!selectedRole && roles?.length) selectRole(roles[0]);

	const deleteRole = (role: Readable<Role>): Promise<DeleteRoleResponseResult> =>
		actions.DeleteRole({
			actor: $actor.actor_id,
			role_id: role.get().role_id,
		});
</script>

<div class="prose padded_1">
	<h1>Manage Roles</h1>
	<ContextInfo {actor} {hub} />
</div>
<div class="content panel">
	{#if roles && selectedRole}
		<div class="roles panel">
			<menu>
				{#each roles as role (role)}
					<ManageRolesItem {role} {defaultRoleId} selected={role === selectedRole} {selectRole} />
				{:else}
					no roles found
				{/each}
			</menu>
			<button type="button" class="plain" on:click={createRole}>create a new role</button>
		</div>
		<div class="details-wrapper">
			<RoleDetails {actor} role={selectedRole} {hub} {deleteRole} />
		</div>
	{:else}
		<Pending_Animation />
	{/if}
</div>

<style>
	.content {
		display: flex;
	}

	button {
		width: 100%;
	}

	.roles {
		padding: var(--spacing_md);
		flex-shrink: 0;
	}

	.roles menu {
		display: flex;
		flex-direction: column;
		align-items: stretch;
	}

	.details-wrapper {
		flex: 1;
	}
</style>
