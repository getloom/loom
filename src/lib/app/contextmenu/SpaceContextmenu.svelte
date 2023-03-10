<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import type {Hub} from '$lib/vocab/hub/hub';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import SpaceEditor from '$lib/ui/SpaceEditor.svelte';
	import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';

	const {
		dispatch,
		ui: {entityById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	$: directory = entityById.get($space.directory_id)!;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<SpaceIcon {space} />
	</svelte:fragment>
	{$space.name}
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: SpaceEditor,
					props: {persona, space, hub},
					dialogProps: {layout: 'page'},
				})}
		>
			Edit Space
		</ContextmenuEntry>
		{#if canDeleteSpace($directory)}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: DeleteSpaceForm,
						props: {persona, hub, space, done: () => dispatch.CloseDialog()},
					})}
			>
				Delete Space
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
			action={() =>
				dispatch.ViewSpace({
					space_id: $space.space_id,
					view: '<EntityExplorer />',
				})}
		>
			View with EntityExplorer
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
