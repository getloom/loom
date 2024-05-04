<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import {getApp} from '$lib/ui/app.js';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {lookupActor} from '$lib/vocab/actor/actorHelpers.js';
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
		to_contextmenu_params(EntityContextmenu, {actor, entity}),
		to_contextmenu_params(ActorContextmenu, {actor: authorActor}),
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
