<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import type {Hub} from '$lib/vocab/hub/hub';
	import EntityIcon from '$lib/ui/EntityIcon.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {getApp} from '$lib/ui/app';
	import {toSearchParams, toHubUrl} from '$lib/ui/url';
	import HubContextmenu from '$lib/app/contextmenu/HubContextmenu.svelte';
	import FreshnessIndicator from '$lib/ui/FreshnessIndicator.svelte';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const {
		ui: {
			contextmenu,
			spaceIdSelectionByHubId,
			spaceById,
			sessionActorIndexById,
			freshnessByHubId,
			entityById,
		},
	} = getApp();

	// TODO should this just use `ui` instead of taking all of these props?
	// could `ui` be more composable, so it could be easily reused e.g. in docs for demonstration purposes?

	export let persona: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let selected = false;

	$: spaceIdSelection = $spaceIdSelectionByHubId.value.get($hub.hub_id);
	$: selectedSpace = spaceIdSelection ? spaceById.get(spaceIdSelection)! : null;
	$: selectedDirectory = selectedSpace ? entityById.get($selectedSpace!.directory_id)! : null;

	$: isPersonaHomeHub = $hub.name === $persona.name;

	$: personaIndex = $sessionActorIndexById.get($persona.persona_id)!;

	$: fresh = freshnessByHubId.get($hub.hub_id);
</script>

<!-- TODO can this be well abstracted via the Entity with a `link` prop? -->
<a
	class="hub selectable"
	href={toHubUrl(
		$hub.name,
		renderDirectoryPath($selectedDirectory?.path),
		toSearchParams($page.url.searchParams, {persona: personaIndex + ''}),
	)}
	class:selected
	class:persona={isPersonaHomeHub}
	style="--hue: {$hub.settings.hue}"
	use:contextmenu.action={[[HubContextmenu, {hub, persona}]]}
>
	{#if $fresh}
		<FreshnessIndicator />
	{/if}
	<!-- TODO maybe use `Avatar`? does `hue` need to be on the link? -->
	<EntityIcon name={$hub.name} type="Hub" />
</a>

<style>
	a {
		display: block;
		/* TODO better way to have active state? this makes the hub nav wider than the luggage button! */
		padding: var(--spacing_xs);
		text-decoration: none;
		position: relative;
	}
	.persona {
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--luggage_size);
		--icon_size: var(--icon_size_sm);
	}
</style>
