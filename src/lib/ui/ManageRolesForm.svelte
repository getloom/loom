<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ManageRolesItem from '$lib/ui/ManageRolesItem.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import type {Role} from '$lib/vocab/role/role';
	import RoleDetails from '$lib/ui/RoleDetails.svelte';
	import type {DeleteRoleResponseResult} from '$lib/app/actionTypes';

	export let persona: Readable<AccountActor>;
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
			actor: $persona.persona_id,
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
			actor: $persona.persona_id,
			role_id: role.get().role_id,
		});
</script>

<div class="markup padded-xl">
	<h1>Manage Roles</h1>
	<ContextInfo {persona} {hub} />
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
			<button type="button" class="plain-button" on:click={createRole}>create a new role</button>
		</div>
		<div class="details-wrapper">
			<RoleDetails {persona} role={selectedRole} {hub} {deleteRole} />
		</div>
	{:else}
		<PendingAnimation />
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
