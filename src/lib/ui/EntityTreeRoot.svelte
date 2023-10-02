<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import EntityTree from '$lib/ui/EntityTree.svelte';
	import EntityTreeItem from '$lib/ui/EntityTreeItem.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import type {QueryStore} from '$lib/util/query';

	const {
		ui: {contextmenu},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let query: QueryStore;
	export let itemComponent = EntityTreeItem;

	$: ({entities} = query);

	$: entitiesCountMinusOne = $entities.value.length - 1;
</script>

<div use:contextmenu.action={to_contextmenu_params(EntityContextmenu, {actor, entity})}>
	<div class="row">
		<span class="select_none">┏</span>
		<svelte:component this={itemComponent} {entity} />
	</div>
	<ul>
		{#each $entities.value as entity, i (entity.get().entity_id)}
			<EntityTree {actor} {entity} {itemComponent} last={i === entitiesCountMinusOne} />
		{/each}
	</ul>
</div>
