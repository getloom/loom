<script lang="ts">
	import {goto} from '$app/navigation';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {toSpaceUrl} from '$lib/ui/url';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {
		ui: {
			personaSelection,
			spaceIdSelectionByCommunityId,
			spaceById,
			communityIdSelectionByPersonaId,
			communityById,
			sessionPersonaIndices,
		},
	} = getApp();

	export let persona: Readable<Persona>;

	$: communityId =
		$communityIdSelectionByPersonaId.value.get($persona.persona_id) || $persona.community_id;
	$: community = communityById.get(communityId)!;
	$: spaceIdSelection = $spaceIdSelectionByCommunityId.value.get($community.community_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;
	$: personaIndex = $sessionPersonaIndices.get(persona)!;
</script>

{#if $personaSelection === persona}
	<li class="menu-item panel" role="none">
		<div class="content">
			<div class="icon"><PersonaAvatar {persona} showName={false} /></div>
			<div class="title"><PersonaAvatar {persona} showIcon={false} /></div>
		</div>
	</li>
{:else}
	<!-- TODO change to a link once the contextmenu supports them -->
	<ContextmenuEntry
		action={() =>
			goto(
				toSpaceUrl($community, $selectedSpace, $page.url.searchParams, {
					persona: personaIndex + '',
				}),
			)}
	>
		<svelte:fragment slot="icon"><PersonaAvatar {persona} showName={false} /></svelte:fragment>
		<PersonaAvatar {persona} showIcon={false} />
	</ContextmenuEntry>
{/if}
