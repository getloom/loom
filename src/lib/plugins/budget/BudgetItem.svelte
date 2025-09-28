<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {slide} from 'svelte/transition';
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {randomHue} from '$lib/util/color.js';
	import {getApp} from '$lib/ui/app.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';	
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
	import {moveDown, moveUp} from '$lib/vocab/entity/entityHelpers.js';
	import type { BudgetItem } from './Budget.svelte';

	const {actor} = getSpaceContext();

	const {
		ui: {contextmenu, actorById},
		actions,
	} = getApp();

	export let entity: Readable<Entity>;
	export let parentList: Readable<Entity>;
	export let updateBudgetNumber: () => void;

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	// TODO refactor to some client view-model for the actor
	$: hue = randomHue($authorActor.name);

	$: first = $parentList.data.orderedItems![0] === $entity.entity_id;
	$: last =
		$parentList.data.orderedItems![$parentList.data.orderedItems!.length - 1] === $entity.entity_id;
	$: enableMoveUp = !first;
	$: enableMoveDown = !last;
	$: $entity ? updateBudgetNumber() : Date.now();
	$: budgetItem = $entity.data.content as any as BudgetItem
	$: icon = budgetItem.itemType == "INCOME" ? '🤑' : '📉'
</script>

<!-- TODO delete `ActorContextmenu` ? should that be handled by the entity contextmenu?
And then ActorContextmenu would be only for *session* actors? `SessionActorContextmenu` -->
<li
	transition:slide
	style="--hue: {hue}"
	use:contextmenu.action={[
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
	]}
>
	<!-- TODO fix a11y -->
	<div class="entity">
		<div class="content prose">
			<div>{icon}</div>
			<div class="category">{budgetItem.category}</div>
			<div class="value">${budgetItem.value}</div>			
		</div>
		<div class="signature">
			<button
				class="plain icon_button"
				title="move up"
				on:click={() => moveUp(entity, parentList, $actor.actor_id, actions)}
				disabled={!enableMoveUp}>↑</button
			>
			<button
				class="plain icon_button"
				title="move down"
				on:click={() => moveDown(entity, parentList, $actor.actor_id, actions)}
				disabled={!enableMoveDown}>↓</button
			>
			<ActorAvatar actor={authorActor} showName={false} />
		</div>
		<button
			class="plain icon_button"
			on:click={() =>
				actions.DeleteEntities({actor: $actor.actor_id, entityIds: [$entity.entity_id]})}
			title="remove item">✕</button
		>
	</div>
</li>

<style>
	li {
		align-items: flex-start;
		flex-direction: column;
	}
	li:hover {
		background-color: var(--fg_1);
	}
	.signature {
		--icon_size: var(--icon_size_sm);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing_sm)
	}
	.entity {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}
	.entity:hover {
		background-color: var(--fg_1);
	}
	.content {
		flex: 1;
		font-size: var(--size_1);
		padding: 0 var(--spacing_md);
		display: flex;
		flex-direction: row;
	}
	.category {
		flex: 2;		
		padding-left: var(--spacing_xs);
		text-align: center;		
	}
	.value {
		text-align: right;
	}
</style>
