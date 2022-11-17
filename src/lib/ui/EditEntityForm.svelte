<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ConfirmDialog from '$lib/ui/ConfirmDialog.svelte';

	export let persona: Readable<AccountPersona>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;

	const {
		dispatch,
		ui: {personaById},
	} = getApp();

	$: authorPersona = personaById.get($entity.persona_id)!;

	const updateEntityDataProperty = async (updated: any, field: string) =>
		dispatch.UpdateEntity({
			actor: $persona.persona_id,
			entity_id: $entity.entity_id,
			data: {...$entity.data, [field]: updated},
		});

	const updateEntityData = async (updated: any) =>
		dispatch.UpdateEntity({
			actor: $persona.persona_id,
			entity_id: $entity.entity_id,
			data: updated,
		});

	// TODO factor this out into a component or something, and handle failures
	let deletePending = false;
	const deleteEntity = async () => {
		deletePending = true;
		await dispatch.DeleteEntities({
			actor: $persona.persona_id,
			entityIds: [$entity.entity_id],
		});
		deletePending = false;
		done?.();
	};

	let erasePending = false;
	const eraseEntity = async () => {
		erasePending = true;
		await dispatch.EraseEntities({
			actor: $persona.persona_id,
			entityIds: [$entity.entity_id],
		});
		erasePending = false;
	};
</script>

<!-- TODO add entity property contextmenu actions to this -->
<form {...$$restProps}>
	<div class="markup" style:--icon_size="var(--icon_size_sm)">
		<h2>Edit Entity</h2>
		<section>
			<!-- TODO resembles `ContextInfo` closely -->
			<div class="row">
				<span class="spaced">created by</span>
				<PersonaAvatar persona={authorPersona} />
			</div>
			<div>created {format($entity.created, 'PPPPp')}</div>
			{#if $entity.updated !== null}
				<div>updated {format($entity.updated, 'PPPPp')}</div>
			{/if}
		</section>
	</div>
	{#if $entity.data.type === 'Tombstone'}
		<section><TombstoneContent {entity} /></section>
	{:else}
		<fieldset>
			<legend>properties</legend>
			<PropertyEditor value={$entity.data.type} field="type" update={updateEntityDataProperty} />
			<PropertyEditor value={$entity.data.name} field="name" update={updateEntityDataProperty} />
			<PropertyEditor
				value={$entity.data.content}
				field="content"
				update={updateEntityDataProperty}
			/>
		</fieldset>
	{/if}
	<fieldset>
		<legend>danger! zone</legend>
		{#if $entity.data.type !== 'Tombstone'}
			<PendingButton
				title="erase entity"
				on:click={() =>
					dispatch.OpenDialog({
						Component: ConfirmDialog,
						props: {
							action: eraseEntity,
							promptText: 'Erase this entity? This cannot be reversed.',
							confirmText: 'erase entity',
						},
					})}
				pending={erasePending}>erase entity</PendingButton
			>
		{/if}
		<PendingButton
			title="delete entity"
			on:click={() =>
				dispatch.OpenDialog({
					Component: ConfirmDialog,
					props: {
						action: deleteEntity,
						promptText: 'Delete this entity? This cannot be reversed.',
						confirmText: 'delete entity',
					},
				})}
			pending={deletePending}>delete entity</PendingButton
		>
	</fieldset>
	<fieldset>
		<legend>advanced</legend>
		<PropertyEditor
			value={$entity.data}
			field="data"
			update={updateEntityData}
			parse={parseJson}
			serialize={serializeJson}
		/>
	</fieldset>
</form>
