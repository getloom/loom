<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import AssignmentInputItem from '$lib/ui/AssignmentInputItem.svelte';
	import {getApp} from '$lib/ui/app';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';

	const {
		ui: {personas, personaSelection, personasByCommunityId},
	} = getApp();

	export let community: Readable<Community>;

	$: selectedPersona = $personaSelection;

	$: communityPersonas = $personasByCommunityId.get($community.community_id)!;

	// TODO speed this up with a better cached data structures
	$: invitableMembers = $community
		? $personas.value.filter((p) => !communityPersonas.includes(p) && p.get().type === 'account')
		: [];
</script>

<div class="markup padded-xl">
	<h1>Invite Members</h1>
	<section class="row">
		<span class="spaced">to</span>
		<CommunityAvatar {community} />
	</section>
	<section class="row">
		{#if selectedPersona}
			<span class="spaced">as</span> <PersonaAvatar persona={selectedPersona} />
		{:else}
			<div>(no persona selected)</div>
		{/if}
	</section>
	{#if selectedPersona}
		{#each invitableMembers as persona (persona)}
			<AssignmentInputItem persona={selectedPersona} assignmentPersona={persona} {community} />
		{:else}
			<p>There's no one new to invite</p>
		{/each}
	{/if}
</div>
