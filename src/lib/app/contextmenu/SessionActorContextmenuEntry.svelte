<script lang="ts">
	import {goto} from '$app/navigation';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {toSearchParams, toHubUrl} from '$lib/ui/url';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const {
		ui: {
			actorSelection,
			spaceIdSelectionByHubId,
			spaceById,
			hubIdSelectionByActorId,
			hubById,
			sessionActorIndexById,
			entityById,
		},
	} = getApp();

	export let persona: Readable<AccountActor>;

	$: hubId = $hubIdSelectionByActorId.value.get($persona.persona_id) || $persona.hub_id;
	$: hub = hubById.get(hubId)!;
	$: spaceIdSelection = $spaceIdSelectionByHubId.value.get($hub.hub_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;
	$: selectedDirectory = selectedSpace ? entityById.get($selectedSpace!.directory_id)! : null;
	$: personaIndex = $sessionActorIndexById.get($persona.persona_id)!;
</script>

{#if $actorSelection === persona}
	<li class="menu-item panel" role="none">
		<div class="content">
			<div class="icon"><ActorAvatar {persona} showName={false} /></div>
			<div class="title"><ActorAvatar {persona} showIcon={false} /></div>
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
		<svelte:fragment slot="icon"><ActorAvatar {persona} showName={false} /></svelte:fragment>
		<ActorAvatar {persona} showIcon={false} />
	</ContextmenuEntry>
{/if}
