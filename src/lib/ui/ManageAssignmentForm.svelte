<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import ManageAssignmentItem from '$lib/ui/ManageAssignmentItem.svelte';

	const {
		ui: {personaSelection, communitiesBySessionPersona},
	} = getApp();

	$: persona = $personaSelection!;
	$: communities = $communitiesBySessionPersona.get(persona)!;
</script>

<div class="markup padded-xl">
	<h1>Manage Assignments</h1>
	<section class="row">
		<!-- TODO likely make these a `select` or picker -->
		<span class="spaced">for</span>
		<PersonaAvatar {persona} />
	</section>
</div>
<ul>
	{#each communities as community (community)}
		<ManageAssignmentItem {persona} {community} />
	{/each}
</ul>

<style>
	ul {
		padding: var(--spacing_xl);
	}
</style>
