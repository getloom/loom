<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import RoleItem from '$lib/ui/RoleItem.svelte';

	const viewContext = getViewContext();
	$: ({hub} = $viewContext);

	const {
		ui: {rolesByHubId, assignmentsByRoleId},
	} = getApp();

	$: roles = $rolesByHubId.get($hub.hub_id)!;
</script>

<ul>
	{#each roles as role (role)}
		<RoleItem {role} {assignmentsByRoleId} />
	{/each}
</ul>
