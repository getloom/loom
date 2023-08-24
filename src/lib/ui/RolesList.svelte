<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import RoleItem from '$lib/ui/RoleItem.svelte';

	const {hub} = getSpaceContext();

	const {
		ui: {rolesByHubId, assignmentsByRoleId},
	} = getApp();

	$: roles = $rolesByHubId.get($hub.hub_id);
</script>

<ul>
	{#if roles}
		{#each roles as role (role)}
			<RoleItem {role} {assignmentsByRoleId} />
		{/each}
	{:else}
		<span>no roles found</span>
	{/if}
</ul>
