<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	const {
		ui: {contextmenu},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let destEntity: Readable<Entity>;
	export let sourceEntity: Readable<Entity>;
	export let tie: Tie;
</script>

<!-- TODO human-readable name? slug? url? path? -->
<div>
	<span class="entity" use:contextmenu.action={[[EntityContextmenu, {actor, entity: sourceEntity}]]}
		><code><small>{$sourceEntity.data.type} {$sourceEntity.entity_id}</small></code></span
	>
	<code class="tie">{tie.type}</code>
	<span class="entity" use:contextmenu.action={[[EntityContextmenu, {actor, entity: destEntity}]]}
		><code><small>{$destEntity.data.type} {$destEntity.entity_id}</small></code></span
	>
</div>

<style>
	.tie {
		padding: 0 var(--spacing_md);
	}
	.entity {
		padding: var(--spacing_md);
	}
</style>
