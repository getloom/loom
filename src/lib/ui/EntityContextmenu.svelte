<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Contextmenu_Entry from '@ryanatkn/fuz/Contextmenu_Entry.svelte';
	import Contextmenu_Submenu from '@ryanatkn/fuz/Contextmenu_Submenu.svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {getApp} from '$lib/ui/app.js';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import EditEntityContentForm from '$lib/ui/EditEntityContentForm.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	export let entity: Readable<Entity>;
	export let actor: Readable<AccountActor>;

	const {actions} = getApp();
</script>

<Contextmenu_Submenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="~" />
	</svelte:fragment>
	Entity {#if $entity.data.type}<code><small>{$entity.data.type}</small></code>{/if}
	<EntityChip {entity} />
	<svelte:fragment slot="menu">
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(
						EditEntityContentForm,
						{actor, entity, done: () => actions.CloseDialog()},
						{layout: 'page'},
					),
				)}
		>
			Edit Entity
			<svelte:fragment slot="icon">></svelte:fragment>
		</Contextmenu_Entry>
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(
						EntityEditor,
						{actor, entity, done: () => actions.CloseDialog()},
						{layout: 'page'},
					),
				)}
		>
			More details
			<svelte:fragment slot="icon">?</svelte:fragment>
		</Contextmenu_Entry>
		<!-- TODO add confirmation dialogs to both delete and erase actions -->
		{#if $entity.data.type !== 'Tombstone'}
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(ConfirmDialog, {
							confirmed: () =>
								actions.EraseEntities({
									actor: $actor.actor_id,
									entityIds: [$entity.entity_id],
								}),
							promptText: 'Erase this entity? This cannot be reversed.',
							confirmText: 'erase entity',
						}),
					)}
			>
				Erase Entity
			</Contextmenu_Entry>
		{/if}
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(ConfirmDialog, {
						confirmed: () =>
							actions.DeleteEntities({actor: $actor.actor_id, entityIds: [$entity.entity_id]}),
						promptText: 'Delete this entity? This cannot be reversed.',
						confirmText: 'delete entity',
					}),
				)}
		>
			Delete Entity
		</Contextmenu_Entry>
	</svelte:fragment>
</Contextmenu_Submenu>
