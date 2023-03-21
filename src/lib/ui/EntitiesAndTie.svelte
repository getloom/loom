<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Entity} from '$lib/vocab/entity/entity';
	import type {Tie} from '$lib/vocab/tie/tie';
	import EntityContextmenu from '$lib/app/contextmenu/EntityContextmenu.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountPersona} from '$lib/vocab/actor/persona';

	const {
		ui: {contextmenu},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let destEntity: Readable<Entity>;
	export let sourceEntity: Readable<Entity>;
	export let tie: Tie;
</script>

<!-- TODO human-readable name? slug? url? path? -->
<div>
	<span
		class="entity"
		use:contextmenu.action={[[EntityContextmenu, {persona, entity: sourceEntity}]]}
		><code><small>{$sourceEntity.data.type} {$sourceEntity.entity_id}</small></code></span
	>
	<code class="tie">{tie.type}</code>
	<span class="entity" use:contextmenu.action={[[EntityContextmenu, {persona, entity: destEntity}]]}
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
