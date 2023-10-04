<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import {getApp} from '$lib/ui/app';
	import type {Entity} from '$lib/vocab/entity/entity';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import TombstoneContent from '$lib/ui/TombstoneContent.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	const {
		actions,
		ui: {contextmenu, actorById},
	} = getApp();

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	const updateEntityDataProperty = async (updated: any, field: string) => {
		const r = await actions.UpdateEntities({
			actor: $actor.actor_id,
			entities: [{entity_id: $entity.entity_id, data: {...$entity.data, [field]: updated}}],
		});
		if (r.ok) done?.();
		return r;
	};
</script>

<form
	{...attrs}
	use:contextmenu.action={[
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
	]}
>
	<header class="prose" style:--icon_size="var(--icon_size_sm)">
		<h2>Edit Entity</h2>
	</header>
	{#if $entity.data.type === 'Tombstone'}
		<section><TombstoneContent {entity} /></section>
	{:else}
		<fieldset>
			<PropertyEditor
				value={$entity.data.content}
				field="content"
				update={updateEntityDataProperty}
				editing
				minimal
				><svelte:fragment slot="field"><div hidden /></svelte:fragment>
			</PropertyEditor>
		</fieldset>
	{/if}
</form>

<style>
	form {
		padding: var(--spacing_1);
		min-width: var(--width_sm);
	}
	/* TODO figure this out more generally, these styles shouldn't be needed --
	should we be using `.prose` instead? */
	fieldset {
		padding: var(--spacing_3) 0;
		margin-top: var(--spacing_1);
	}
</style>
