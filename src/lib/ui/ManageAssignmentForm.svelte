<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import ManageAssignmentItem from '$lib/ui/ManageAssignmentItem.svelte';

	const {
		ui: {personaSelection, communitiesBySessionPersona},
	} = getApp();

	$: persona = $personaSelection!;
	$: communities = $communitiesBySessionPersona.get(persona)!;
</script>

<form class="padded-xl" {...$$restProps}>
	<legend>Manage Assignments</legend>
	<ContextInfo {persona} />
	<ul>
		{#each communities as community (community)}
			<ManageAssignmentItem {persona} {community} />
		{/each}
	</ul>
</form>
