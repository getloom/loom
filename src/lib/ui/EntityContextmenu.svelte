<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import ContextmenuEntry from '@fuz.dev/fuz/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@fuz.dev/fuz/ContextmenuSubmenu.svelte';
	import {to_dialog_params} from '@fuz.dev/fuz/dialog.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import EditEntityContentForm from '$lib/ui/EditEntityContentForm.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	export let entity: Readable<Entity>;
	export let actor: Readable<AccountActor>;

	const {actions} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="~" />
	</svelte:fragment>
	Entity {#if $entity.data.type}<code><small>{$entity.data.type}</small></code>{/if}
	<EntityChip {entity} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
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
		</ContextmenuEntry>
		<ContextmenuEntry
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
		</ContextmenuEntry>
		<!-- TODO add confirmation dialogs to both delete and erase actions -->
		{#if $entity.data.type !== 'Tombstone'}
			<ContextmenuEntry
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
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
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
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
