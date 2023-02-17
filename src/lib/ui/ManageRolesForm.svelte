<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ManageRolesItem from '$lib/ui/ManageRolesItem.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import type {Role} from '$lib/vocab/role/role';
	import RoleDetails from '$lib/ui/RoleDetails.svelte';
	import type {DeleteRoleResponseResult} from '$lib/app/eventTypes';

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;

	$: defaultRoleId = $community.settings.defaultRoleId;

	const {
		dispatch,
		ui: {rolesByCommunityId, roleById},
	} = getApp();

	$: roles = $rolesByCommunityId.get($community.community_id);

	const createRole = async () => {
		//TODO better error handling
		const result = await dispatch.CreateRole({
			actor: $persona.persona_id,
			community_id: $community.community_id,
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
		dispatch.DeleteRole({
			actor: $persona.persona_id,
			role_id: role.get().role_id,
		});
</script>

<div class="markup padded-xl">
	<h1>Manage Roles</h1>
	<ContextInfo {persona} {community} />
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
			<RoleDetails {persona} role={selectedRole} {community} {deleteRole} />
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
