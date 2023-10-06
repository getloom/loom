<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import EditEntityForm from '$lib/ui/EditEntityForm.svelte';

	export let actor: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;

	const {devmode} = getApp();
</script>

<div class="entity-editor width_md">
	<EditEntityForm {actor} {entity} {done} />
	{#if $devmode}
		<hr />
		<section>
			<EntityTable {actor} {entity} />
		</section>
	{/if}
</div>

<style>
	.entity-editor {
		padding: var(--spacing_1);
	}
</style>
