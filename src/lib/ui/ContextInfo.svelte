<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import type {Space} from '$lib/vocab/space/space';
	import SpaceName from '$lib/ui/SpaceName.svelte';

	export let persona: Readable<AccountPersona> | null = null;
	export let community: Readable<Community> | null = null;
	export let space: Readable<Space> | null = null;
</script>

<div class="context-info">
	{#if space && persona && community}
		<div class="row" style:font-size="var(--font_size_xl)">
			<SpaceName {space} />
		</div>
	{/if}
	{#if community}
		<div class="row">
			<span class="spaced">in</span>
			<CommunityAvatar {community} />
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
