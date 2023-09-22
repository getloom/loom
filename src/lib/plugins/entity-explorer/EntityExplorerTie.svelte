<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {to_contextmenu_params} from '@fuz.dev/fuz/contextmenu.js';

	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import type {Tie} from '$lib/vocab/tie/tie';
	import EntityChip from '$lib/ui/EntityChip.svelte';

	const {
		ui: {contextmenu, entityById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let tie: Tie;
	export let source = false;
	export let dest = false;

	$: sourceEntity = entityById.get(tie.source_id);
	$: destEntity = entityById.get(tie.dest_id);
</script>

<!-- use:contextmenu.action={[
	// TODO TieContextmenu ?
	// to_contextmenu_params(TieContextmenu, {actor, tie, sourceEntity, destEntity}),
]} -->
<div class="tie">
	<div class="row">{tie.type} tie &nbsp; <code>{tie.tie_id}</code></div>
	{#if source && sourceEntity && $sourceEntity}
		<details
			use:contextmenu.action={[
				to_contextmenu_params(EntityContextmenu, {actor, entity: sourceEntity}),
			]}
		>
			<summary>
				source <EntityChip entity={sourceEntity} />
				<code>{JSON.stringify($sourceEntity.data)}</code>
			</summary>
			<pre class="panel padded_sm">{JSON.stringify($sourceEntity, null, 2)}</pre>
		</details>
	{/if}
	{#if dest && destEntity && $destEntity}
		<details
			use:contextmenu.action={[
				to_contextmenu_params(EntityContextmenu, {actor, entity: destEntity}),
			]}
		>
			<summary>
				dest <EntityChip entity={destEntity} /> <code>{JSON.stringify($destEntity.data)}</code>
			</summary>
			<pre class="panel padded_sm">{JSON.stringify($destEntity, null, 2)}</pre>
		</details>
	{/if}
</div>

<style>
	.tie {
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
