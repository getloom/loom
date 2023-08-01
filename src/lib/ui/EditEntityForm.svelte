<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';
	import SourceEntities from '$lib/ui/SourceEntities.svelte';
	import DestEntities from '$lib/ui/DestEntities.svelte';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	const {
		actions,
		ui: {contextmenu, actorById},
	} = getApp();

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	const updateEntityDataProperty = async (updated: any, field: string) =>
		actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: {...$entity.data, [field]: updated}}],
		});

	const updateEntityData = async (updated: any) =>
		actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: updated}],
		});
	const updateEntityPath = async (updated: string | null) =>
		actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, path: updated === '' ? null : updated}],
		});

	// TODO factor this out into a component or something, and handle failures
	let deletePending = false;
	const deleteEntity = async () => {
		deletePending = true;
		await actions.DeleteEntities({
			actor: $actor.actor_id,
			entityIds: [$entity.entity_id],
		});
		deletePending = false;
		done?.();
	};

	let erasePending = false;
	const eraseEntity = async () => {
		erasePending = true;
		await actions.EraseEntities({
			actor: $actor.actor_id,
			entityIds: [$entity.entity_id],
		});
		erasePending = false;
	};
</script>

<form
	{...attrs}
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<header class="prose" style:--icon_size="var(--icon_size_sm)">
		<h2>Edit Entity</h2>
		<section>
			<!-- TODO resembles `ContextInfo` closely -->
			<div><code>{$entity.data.type}</code> <EntityChip {entity} /></div>
			<div class="row">
				<span class="spaced_hz">created by</span>
				<ActorAvatar actor={authorActor} />
			</div>
			<div>created {format($entity.created, 'PPPPp')}</div>
			{#if $entity.updated !== null}
				<div>updated {format($entity.updated, 'PPPPp')}</div>
			{/if}
		</section>
	</header>
	{#if $entity.data.type === 'Tombstone'}
		<section><TombstoneContent {entity} /></section>
	{:else}
		<fieldset>
			<legend>data</legend>
			<PropertyEditor
				value={$entity.data.type}
				field="type"
				update={updateEntityDataProperty}
				deletable={true}
			/>
			<PropertyEditor
				value={$entity.data.name}
				field="name"
				update={updateEntityDataProperty}
				deletable={true}
			/>
			<PropertyEditor
				value={$entity.data.content}
				field="content"
				update={updateEntityDataProperty}
				deletable={true}
			/>
		</fieldset>
	{/if}
	<fieldset>
		<legend class="error_text">danger zone</legend>
		{#if $entity.data.type !== 'Tombstone'}
			<PendingButton
				title="erase entity"
				on:click={() =>
					actions.OpenDialog(
						toDialogParams(ConfirmDialog, {
							confirmed: eraseEntity,
							promptText: 'Erase this entity? This cannot be reversed.',
							confirmText: 'erase entity',
						}),
					)}
				pending={erasePending}>erase entity</PendingButton
			>
		{/if}
		<PendingButton
			title="delete entity"
			on:click={() =>
				actions.OpenDialog(
					toDialogParams(ConfirmDialog, {
						confirmed: deleteEntity,
						promptText: 'Delete this entity? This cannot be reversed.',
						confirmText: 'delete entity',
					}),
				)}
			pending={deletePending}>delete entity</PendingButton
		>
	</fieldset>
	<fieldset>
		<legend>properties</legend>
		<PropertyEditor value={$entity.entity_id} field="entity_id" />
		<!-- TODO add contextmenu entries for this actor -->
		<PropertyEditor value={$entity.actor_id} field="actor_id" />
		<PropertyEditor
			value={$entity.path}
			field="path"
			update={updateEntityPath}
			parse={(v) => ({ok: true, value: v?.length && !v.startsWith('/') ? '/' + v : v})}
		/>
		<PropertyEditor
			value={$entity.data}
			field="data"
			update={updateEntityData}
			parse={parseJson}
			serialize={serializeJson}
		/>
	</fieldset>
	<SourceEntities {actor} {entity} />
	<DestEntities {actor} {entity} />
</form>

<style>
	/* TODO figure this out more generally, these styles shouldn't be needed --
	should we be using `.prose` instead? */
	fieldset {
		padding: var(--spacing_xl3) 0;
		margin-top: var(--spacing_xl);
	}
	legend {
		margin-bottom: 0;
	}
</style>
