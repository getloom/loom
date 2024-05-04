<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import {to_contextmenu_params} from '@ryanatkn/fuz/contextmenu.js';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import type {Tie} from '$lib/vocab/tie/tie.js';
	import EntityContextmenu from '$lib/ui/EntityContextmenu.svelte';
	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

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
	<span
		class="entity"
		use:contextmenu.action={to_contextmenu_params(EntityContextmenu, {actor, entity: sourceEntity})}
		><code><small>{$sourceEntity.data.type} {$sourceEntity.entity_id}</small></code></span
	>
	<code class="tie">{tie.type}</code>
	<span
		class="entity"
		use:contextmenu.action={to_contextmenu_params(EntityContextmenu, {actor, entity: destEntity})}
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
