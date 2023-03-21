<script lang="ts">
	import {goto} from '$app/navigation';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {toSearchParams, toHubUrl} from '$lib/ui/url';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const {
		ui: {
			personaSelection,
			spaceIdSelectionByHubId,
			spaceById,
			hubIdSelectionByPersonaId,
			hubById,
			sessionPersonaIndexById,
			entityById,
		},
	} = getApp();

	export let persona: Readable<AccountPersona>;

	$: hubId = $hubIdSelectionByPersonaId.value.get($persona.persona_id) || $persona.hub_id;
	$: hub = hubById.get(hubId)!;
	$: spaceIdSelection = $spaceIdSelectionByHubId.value.get($hub.hub_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;
	$: selectedDirectory = selectedSpace ? entityById.get($selectedSpace!.directory_id)! : null;
	$: personaIndex = $sessionPersonaIndexById.get($persona.persona_id)!;
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
		run={() =>
			goto(
				toHubUrl(
					$hub.name,
					renderDirectoryPath($selectedDirectory?.path),
					toSearchParams($page.url.searchParams, {persona: personaIndex + ''}),
				),
			)}
	>
		<svelte:fragment slot="icon"><PersonaAvatar {persona} showName={false} /></svelte:fragment>
		<PersonaAvatar {persona} showIcon={false} />
	</ContextmenuEntry>
{/if}
