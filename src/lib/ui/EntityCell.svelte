<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {scale} from 'svelte/transition';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {EntityColumn} from '$lib/vocab/entity/entityHelpers.server.js';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let propertyName: string;

	const {actions} = getApp();

	$: value = $entity[propertyName as EntityColumn];

	const serialize = (propertyName: string, $entity: Entity) =>
		propertyName === 'data' || propertyName === 'view' ? JSON.stringify($entity.data) : undefined;

	$: serialized = serialize(propertyName, $entity); // TODO
	let updated = serialize(propertyName, $entity);
	$: changed = updated !== serialized;

	let errorMessage: string | null = null;

	const save = async () => {
		errorMessage = null;
		if (!changed) return;
		let updatedData: (typeof $entity)['data'];
		try {
			updatedData = JSON.parse(updated!);
		} catch (err) {
			errorMessage = 'invalid json';
			return;
		}
		const result = await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: updatedData}],
		});
		if (!result.ok) errorMessage = result.message;
	};

	const reset = () => {
		updated = serialize(propertyName, $entity);
	};
</script>

{#if propertyName.endsWith('_id')}
	<!-- TODO  propertyName === 'actor_id' etc -->
	{value}
{:else if propertyName === 'data' || propertyName === 'view'}<textarea
		bind:value={updated}
	/>{:else}
	{value}
{/if}
{#if changed}
	<div class="buttons" in:scale>
		<button type="button" on:click={reset}>reset</button>
		<button type="button" on:click={save}>save</button>
	</div>
{/if}
{#if errorMessage}
	<Alert status="error">{errorMessage}</Alert>
{/if}
