<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import {getViewContext} from '$lib/vocab/view/view';
	import RoleItem from '$lib/ui/RoleItem.svelte';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	const {
		ui: {rolesByCommunityId, assignmentsByRoleId},
	} = getApp();

	$: roles = $rolesByCommunityId.get($community.community_id)!;
</script>

<ul>
	{#each roles as role (role)}
		<RoleItem {role} {assignmentsByRoleId} />
	{/each}
</ul>
