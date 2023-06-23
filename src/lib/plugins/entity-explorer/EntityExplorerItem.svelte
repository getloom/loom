<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams} from '@feltjs/felt-ui/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity';
	import {getApp} from '$lib/ui/app';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers';
	import EntityExplorerTie from '$lib/plugins/entity-explorer/EntityExplorerTie.svelte';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	const {
		ui: {contextmenu, actorById, tiesBySourceId, tiesByDestId},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;

	$: ({entity_id} = $entity);

	$: authorActor = lookupActor(actorById, $entity.actor_id);

	$: destTies = tiesBySourceId.get(entity_id);
	$: sourceTies = tiesByDestId.get(entity_id);
</script>

<li
	use:contextmenu.action={[
		toContextmenuParams(EntityContextmenu, {actor, entity}),
		toContextmenuParams(ActorContextmenu, {actor: authorActor}),
	]}
>
	<details>
		<summary>
			entity <EntityChip {entity} /><code>{JSON.stringify($entity.data)}</code>
		</summary>
		<pre class="panel padded_sm">{JSON.stringify($entity, null, 2)}</pre>
	</details>
	<div>
		{#if $destTies}
			{#each Array.from($destTies.value) as tie (tie)}
				<EntityExplorerTie {actor} {tie} dest={true} />
			{/each}
		{/if}
		{#if $sourceTies}
			{#each Array.from($sourceTies.value) as tie (tie)}
				<EntityExplorerTie {actor} {tie} source={true} />
			{/each}
		{/if}
	</div>
</li>

<style>
	li {
		padding: var(--spacing_sm);
		border: var(--border_width) var(--border_style) var(--border_color);
		margin: 10px;
		padding: 10px;
		background-color: var(--input_bg);
		overflow: auto;
		display: flex;
		flex-direction: column;
	}
</style>
