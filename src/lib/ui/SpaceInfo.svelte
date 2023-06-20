<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {randomHue} from '$lib/util/color';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url';
	import {getApp} from '$lib/ui/app';
	import SpaceContextmenu from '$lib/ui/SpaceContextmenu.svelte';
	import SpaceName from '$lib/ui/SpaceName.svelte';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const {
		ui: {contextmenu, sessionActorIndexById, entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let selected = false;

	$: directory = entityById.get($space.directory_id)!;

	$: hue = randomHue($space.name); // TODO add custom setting on spaces

	$: actorIndex = $sessionActorIndexById.get($actor.actor_id)!;
</script>

<a
	href={toHubUrl(
		$hub.name,
		renderDirectoryPath($directory.path),
		toAppSearchParams(actorIndex + '', $page.url.searchParams),
	)}
	class:selected
	class="space-info"
	style="--hue: {hue}"
	use:contextmenu.action={toContextmenuParams(SpaceContextmenu, {actor, hub, space})}
>
	<div class="name"><SpaceName {space} /></div>
	<div>
		{renderDirectoryPath($directory.path)}
	</div>
</a>

<style>
	.space-info {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.name {
		font-size: var(--size_xl);
		display: flex;
		align-items: center;
	}
</style>
