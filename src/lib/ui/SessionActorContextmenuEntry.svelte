<script lang="ts">
	import {goto} from '$app/navigation';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';
	import Contextmenu_Entry from '@fuz.dev/fuz_contextmenu/Contextmenu_Entry.svelte';

	import {getApp} from '$lib/ui/app.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers.js';

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

	export let actor: Readable<AccountActor>;

	$: hubId = $hubIdSelectionByActorId.value.get($actor.actor_id) || $actor.hub_id;
	$: hub = hubById.get(hubId)!;
	$: spaceIdSelection = $spaceIdSelectionByHubId.value.get($hub.hub_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;
	$: selectedDirectory = selectedSpace ? entityById.get($selectedSpace!.directory_id)! : null;
	$: actorIndex = $sessionActorIndexById.get($actor.actor_id)!;
</script>

{#if $actorSelection === actor}
	<li class="menu_item panel" role="none">
		<div class="content">
			<div class="icon"><ActorAvatar {actor} showName={false} /></div>
			<div class="title"><ActorAvatar {actor} showIcon={false} /></div>
		</div>
	</li>
{:else}
	<!-- TODO change to a link once the contextmenu supports them -->
	<Contextmenu_Entry
		run={() =>
			goto(
				toHubUrl(
					$hub.name,
					renderDirectoryPath($selectedDirectory?.path),
					toAppSearchParams(actorIndex, $page.url.searchParams),
				),
			)}
	>
		<svelte:fragment slot="icon"><ActorAvatar {actor} showName={false} /></svelte:fragment>
		<ActorAvatar {actor} showIcon={false} />
	</Contextmenu_Entry>
{/if}
