<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app';
	import EntityTable from '$lib/ui/EntityTable.svelte';
	import type {Entity} from '$lib/vocab/entity/entity';
	import type {AccountActor} from '$lib/vocab/actor/persona';
	import EditEntityForm from '$lib/ui/EditEntityForm.svelte';

	export let persona: Readable<AccountActor>;
	export let entity: Readable<Entity>;
	export let done: (() => void) | undefined = undefined;

	const {devmode} = getApp();
</script>

<div class="entity-editor column">
	<EditEntityForm {persona} {entity} {done} />
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
</style>
