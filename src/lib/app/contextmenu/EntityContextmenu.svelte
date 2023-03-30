<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import EntityEditor from '$lib/ui/EntityEditor.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';

	export let entity: Readable<Entity>;
	export let persona: Readable<AccountActor>;

	const {actions} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="~" />
	</svelte:fragment>
	Entity {#if $entity.data.type}<code><small>{$entity.data.type}</small></code>{/if}
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: EntityEditor,
					props: {persona, entity, done: () => actions.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Edit Entity
		</ContextmenuEntry>
		<!-- TODO add confirmation dialogs to both delete and erase actions -->
		{#if $entity.data.type !== 'Tombstone'}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog({
						Component: ConfirmDialog,
						props: {
							confirmed: () =>
								actions.EraseEntities({
									actor: $persona.persona_id,
									entityIds: [$entity.entity_id],
								}),
							promptText: 'Erase this entity? This cannot be reversed.',
							confirmText: 'erase entity',
						},
					})}
			>
				Erase Entity
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: ConfirmDialog,
					props: {
						confirmed: () =>
							actions.DeleteEntities({actor: $persona.persona_id, entityIds: [$entity.entity_id]}),
						promptText: 'Delete this entity? This cannot be reversed.',
						confirmText: 'delete entity',
					},
				})}
		>
			Delete Entity
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
