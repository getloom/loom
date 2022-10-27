<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ManageRolesItem from '$lib/ui/ManageRolesItem.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import type {Persona} from '$lib/vocab/persona/persona';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	import type {Role} from '$lib/vocab/role/role';
	import RoleDetails from '$lib/ui/RoleDetails.svelte';

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;

	$: defaultRoleId = $community.settings.defaultRoleId;

	const {
		dispatch,
		ui: {rolesByCommunityId},
	} = getApp();

	$: roles = $rolesByCommunityId.get($community.community_id);

	const createRole = async () => {
		//TODO better error handling
		await dispatch.CreateRole({
			actor: $persona.persona_id,
			community_id: $community.community_id,
			name: 'new role',
		});
	};

	let selectedRole: Readable<Role> | null = null as any;
	const selectRole = (role: Readable<Role>) => {
		if (selectedRole === role) {
			selectedRole = null;
		} else {
			selectedRole = role;
		}
	};
</script>

<div class="markup padded-xl">
	<h1>Manage Roles</h1>
	<ContextInfo {persona} {community} />
</div>
<div class="panel">
	<div class="roles">
		<button on:click={createRole}>Create Role +</button>
		<ul>
			{#if roles}
				{#if roles.length === 0}no roles found....{/if}
				{#each roles as role (role)}
					<ManageRolesItem {role} {defaultRoleId} {selectedRole} {selectRole} />
				{/each}
			{:else}
				<PendingAnimation />
			{/if}
		</ul>
	</div>
	{#if selectedRole && $selectedRole}
		<RoleDetails {persona} role={selectedRole} {community} />
	{/if}
</div>

<style>
	.panel {
		display: flex;
		flex-direction: row;
	}

	.roles {
		padding: var(--spacing_md);
		background-color: rgba(0, 0, 0, 0.1);
		flex: 1;
	}
</style>
