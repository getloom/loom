<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@feltjs/felt-ui/ContextmenuSubmenu.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import type {Hub} from '$lib/vocab/hub/hub';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import SpaceEditor from '$lib/ui/SpaceEditor.svelte';
	import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';

	const {
		actions,
		ui: {entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
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
			run={() =>
				actions.OpenDialog(toDialogParams(SpaceEditor, {actor, space, hub}, {layout: 'page'}))}
		>
			Edit Space
		</ContextmenuEntry>
		{#if canDeleteSpace($directory)}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog(
						toDialogParams(DeleteSpaceForm, {actor, hub, space, done: () => actions.CloseDialog()}),
					)}
			>
				Delete Space
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
			run={() =>
				actions.ViewSpace({
					space_id: $space.space_id,
					view: '<EntityExplorer />',
				})}
		>
			View with EntityExplorer
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
