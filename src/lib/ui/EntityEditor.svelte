<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;

	const {
		dispatch,
		devmode,
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
</script>

<div class="entity-editor column">
	<div class="markup padded-xl">
		<h1>Edit Entity</h1>
		<section class="row">
			<span class="spaced">created by</span>
			<PersonaAvatar persona={authorPersona} />
		</section>
		<section style:--icon_size="var(--icon_size_sm)">
			<p>created {format($entity.created, 'PPPPp')}</p>
			{#if $entity.updated !== null}
				<p>updated {format($entity.updated, 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		{#if $entity.data.type === 'Tombstone'}
			<div><TombstoneContent {entity} /></div>
			<PendingButton on:click={() => deleteEntity()} pending={deletePending}
				>delete entity</PendingButton
			>
		{:else}
			<fieldset>
				<!-- TODO how to make this use `EntityContent`? slot? could default to the `pre` -->
				<PropertyEditor
					value={$entity.data.content}
					field="content"
					update={updateEntityDataProperty}
				/>
			</fieldset>
			{#if $devmode}
				<fieldset>
					<PropertyEditor
						value={$entity.data}
						field="data"
						update={updateEntityData}
						parse={parseJson}
						serialize={serializeJson}
					/>
				</fieldset>
			{/if}
		{/if}
	</form>
	{#if $devmode}
		<hr />
		<section>
			<EntityTable {persona} {entity} />
		</section>
	{/if}
</div>

<style>
	.entity-editor {
		padding: var(--spacing_xl);
	}
	h1 {
		text-align: center;
	}
	fieldset {
		padding: var(--spacing_xl) 0;
	}
</style>
