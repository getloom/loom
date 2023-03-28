<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/ui/color';
	import {getApp} from '$lib/ui/app';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import EntityContent from '$lib/ui/EntityContent.svelte';
	import type {Space} from '$lib/vocab/space/space';
	import type {AccountActor} from '$lib/vocab/actor/persona';
	import {lookupTies} from '$lib/vocab/tie/tieHelpers';
	import {lookupPersona} from '$lib/vocab/actor/actorHelpers';

	const {
		ui: {contextmenu, personaById, destTiesBySourceEntityId, entityById},
		actions,
	} = getApp();

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let space: Readable<Space>;
	export let selectedList: Readable<Entity> | null;
	export let selectList: (list: Readable<Entity>) => void;

	$: selected = selectedList ? selectedList === entity : false;
	let pending = false;

	$: destTies = lookupTies(destTiesBySourceEntityId, $entity.entity_id);

	$: items = Array.from($destTies.value).reduce((acc, tie) => {
		if (tie.type === 'HasItem') {
			acc.push(entityById.get(tie.dest_id)!);
		}
		return acc;
	}, [] as Array<Readable<Entity>>);

	$: ({checked} = $entity.data);

	$: authorPersona = lookupPersona(personaById, $entity.persona_id);

	// TODO refactor to some client view-model for the persona
	$: hue = randomHue($authorPersona.name);

	$: if (checked !== undefined) void updateEntity(checked);

	$: hasItems = items !== undefined || $entity.data.type === 'Collection';
	$: hasChecked = checked !== undefined || $entity.data.type === 'Note';

	const updateEntity = async (checked: boolean) => {
		if ($entity.data.checked === checked) return;
		pending = true;
		await actions.UpdateEntity({
			actor: $persona.persona_id,
			entity_id: $entity.entity_id,
			data: {...$entity.data, checked},
		});
		pending = false;
	};

	const renderEntity = (entity: Entity): boolean => {
		const type = entity.data.type;
		//1) Only render Collections or Notes
		if (!(type === 'Collection' || type === 'Note')) return false;
		return true;
	};
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* personas? `SessionActorContextmenu` -->
{#if renderEntity($entity)}
	<li
		style="--hue: {hue}"
		use:contextmenu.action={[
			[EntityContextmenu, {persona, entity}],
			[ActorContextmenu, {persona: authorPersona}],
		]}
	>
		<!-- TODO fix a11y -->
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<div on:click={() => selectList(entity)} class="entity markup formatted">
			{#if hasItems}
				<div class="icon-button">
					{#if selected}👉{:else}📝{/if}
				</div>
			{/if}
			{#if hasChecked}
				<!-- TODO checkbox not updated properly on event broadcast-->
				<!-- TODO maybe use Felt checkbox component when available-->
				<input type="checkbox" disabled={pending} bind:checked />
			{/if}
			<div class="text">
				<EntityContent {entity} />
			</div>
			<div class="signature">
				<ActorAvatar persona={authorPersona} showName={false} />
			</div>
		</div>
		{#if items && selected}
			<div class="items panel">
				<ul>
					{#each items as item (item)}
						<svelte:self {persona} entity={item} {space} {selectedList} {selectList} />
					{/each}
				</ul>
			</div>
		{/if}
	</li>
{/if}

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
		padding: var(--spacing_xs);
		padding-left: var(--spacing_xl3);
	}
	.signature {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.entity {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
	.entity:hover {
		background-color: var(--tint_dark_1);
	}
	.entity form input {
		width: 50px;
		min-width: auto;
	}
	.items {
		width: 100%;
	}
	.markup {
		/* the bottom padding prevents chars like y and g from being cut off */
		padding: 0 0 var(--spacing_xs) var(--spacing_md);
	}
	.icon-button {
		font-size: var(--font_size_xl);
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}
	.text {
		text-align: center;
		flex-grow: 2;
	}
</style>
