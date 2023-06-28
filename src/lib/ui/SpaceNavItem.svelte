<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {AccountActor} from '$lib/vocab/actor/actor';
	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url';
	import {getApp} from '$lib/ui/app';
	import SpaceContextmenu from '$lib/ui/SpaceContextmenu.svelte';
	import SpaceName from '$lib/ui/SpaceName.svelte';
	import FreshnessIndicator from '$lib/ui/FreshnessIndicator.svelte';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const {
		actions,
		ui: {
			contextmenu,
			mobile,
			expandMainNav,
			sessionActorIndexById,
			freshnessByDirectoryId,
			entityById,
		},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;
	export let selected: boolean;

	$: directory = entityById.get($space.directory_id)!;

	$: actorIndex = $sessionActorIndexById.get($actor.actor_id)!;
	$: fresh = freshnessByDirectoryId.get($space.directory_id)!;
</script>

<a
	href={toHubUrl(
		$hub.name,
		renderDirectoryPath($directory.path),
		toAppSearchParams(actorIndex, $page.url.searchParams),
	)}
	class="selectable_bg"
	class:selected
	use:contextmenu.action={toContextmenuParams(SpaceContextmenu, {actor, hub, space})}
	on:click={() => {
		// TODO Should this be a click handler or react to UI system actions/changes?
		// Might make more UX sense to make it react to any state changes,
		// no matter the source -- e.g. we'll add commands that don't involve this click handler.
		// That's probably what the user wants,
		// but the problem is that we also want to close the main nav
		// when the user clicks the already-selected space. For now this is fine.
		if ($mobile && $expandMainNav) actions.ToggleMainNav();
	}}
>
	{#if $fresh}
		<FreshnessIndicator />
	{/if}
	<SpaceName {space} />
</a>

<style>
	a {
		position: relative;
		display: flex;
		align-items: center;
		text-decoration: none;
	}
</style>
