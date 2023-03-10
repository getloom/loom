<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import CreateSpaceForm from '$lib/ui/CreateSpaceForm.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import type {Hub} from '$lib/vocab/hub/hub';
	import CreateEntityForm from '$lib/ui/CreateEntityForm.svelte';
	import {getApp} from '$lib/ui/app';
	import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';

	// TODO problem here is that some of these `SpacePath`s are actually `EntityPath`s off the root space, refactor with Path stuff
	type PathType = 'SpacePath' | 'EntityPath';
	const toPathType = (spaceParam: string): PathType =>
		spaceParam.includes('/') ? 'EntityPath' : 'SpacePath';

	const {
		ui: {spacesByHubId, entityById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let hub: Readable<Hub>;

	let selectedView: 'space' | 'entity' =
		toPathType($page.params.space || '') === 'EntityPath' ? 'entity' : 'space';

	$: spaces = $spacesByHubId.get($hub.hub_id);
	$: homeSpace = spaces?.find((s) => isHomeSpace(entityById.get(s.get().directory_id)!.get()));

	$: spaceParam = $page.params.space || '';
	$: pathType = toPathType(spaceParam);
	$: initialSpaceName = pathType === 'SpacePath' ? spaceParam : undefined;
</script>

<!-- TODO reusable components -->
<div class="column-sm">
	<!-- TODO a11y -->
	<div class="buttons">
		<button
			type="button"
			class:selected={selectedView === 'space'}
			on:click={() => (selectedView = 'space')}
		>
			create space
		</button>
		<button
			type="button"
			class:selected={selectedView === 'entity'}
			on:click={() => (selectedView = 'entity')}
		>
			create entity
		</button>
	</div>
	{#if selectedView === 'space'}
		<CreateSpaceForm {persona} {hub} initialName={initialSpaceName} />
	{:else if selectedView === 'entity'}
		{#if homeSpace}
			<CreateEntityForm {persona} {hub} space={homeSpace} />
		{:else}
			<span class="error-text">[error: expected a space]</span>
		{/if}
	{/if}
</div>
