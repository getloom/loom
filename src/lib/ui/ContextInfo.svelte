<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceName from '$lib/ui/SpaceName.svelte';

	export let persona: Readable<AccountPersona> | null = null;
	export let hub: Readable<Hub> | null = null;
	export let space: Readable<Space> | null = null;
</script>

<div class="context-info">
	{#if space && persona && hub}
		<div class="row" style:font-size="var(--font_size_xl)">
			<SpaceName {space} />
		</div>
	{/if}
	{#if hub}
		<div class="row">
			<span class="spaced">in</span>
			<HubAvatar {hub} />
		</div>
	{/if}
	{#if persona}
		<div class="row">
			<span class="spaced">as</span>
			<PersonaAvatar {persona} />
		</div>
	{/if}
</div>

<style>
	.context-info {
		--icon_size: var(--icon_size_sm);
		margin-bottom: var(--spacing_lg);
	}
	.row {
		margin-bottom: var(--spacing_sm);
	}
	.row:last-child {
		margin-bottom: 0;
	}
</style>
