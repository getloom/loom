<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Contextmenu_Entry from '@ryanatkn/fuz/Contextmenu_Entry.svelte';
	import Contextmenu_Submenu from '@ryanatkn/fuz/Contextmenu_Submenu.svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import {getApp} from '$lib/ui/app.js';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import DeleteSpaceForm from '$lib/ui/DeleteSpaceForm.svelte';
	import SpaceIcon from '$lib/ui/SpaceIcon.svelte';
	import SpaceEditor from '$lib/ui/SpaceEditor.svelte';
	import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers.js';

	const {
		actions,
		ui: {entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let space: Readable<Space>;

	$: directory = entityById.get($space.directory_id)!;
</script>

<Contextmenu_Submenu>
	<svelte:fragment slot="icon">
		<SpaceIcon {space} />
	</svelte:fragment>
	{$space.name}
	<svelte:fragment slot="menu">
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(to_dialog_params(SpaceEditor, {actor, space, hub}, {layout: 'page'}))}
		>
			Edit Space
		</Contextmenu_Entry>
		{#if canDeleteSpace($directory)}
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(DeleteSpaceForm, {
							actor,
							hub,
							space,
							done: () => actions.CloseDialog(),
						}),
					)}
			>
				Delete Space
			</Contextmenu_Entry>
		{/if}
		<Contextmenu_Entry
			run={() =>
				actions.ViewSpace({
					space_id: $space.space_id,
					view: '<EntityExplorer />',
				})}
		>
			View with EntityExplorer
		</Contextmenu_Entry>
	</svelte:fragment>
</Contextmenu_Submenu>
