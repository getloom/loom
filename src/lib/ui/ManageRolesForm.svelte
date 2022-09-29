<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ManageRolesItem from '$lib/ui/ManageRolesItem.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import type {Persona} from '$lib/vocab/persona/persona';
	import CommunityAvatar from './CommunityAvatar.svelte';
	import PendingAnimation from '@feltcoop/felt/ui/PendingAnimation.svelte';

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;

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
</script>

<div class="markup padded-xl">
	<h1>Manage Community Roles for <CommunityAvatar {community} /></h1>
</div>
<div class="panel">
	<div class="roles">
		<button on:click={createRole}>Create Role +</button>
		<ul>
			{#if roles}
				{#if roles.length === 0}no roles found....{/if}
				{#each roles as role (role)}
					<ManageRolesItem {role} />
				{/each}
			{:else}
				<PendingAnimation />
			{/if}
		</ul>
	</div>
	<div class="details">
		<h2>Manage Members</h2>
		[list of members with role goes here]
		<h2>Permissions</h2>
		[list of toggles goes here]
	</div>
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
	.details {
		padding: var(--spacing_md);
		flex: 2;
		background-color: rgba(0, 0, 0, 0.45);
	}
</style>
