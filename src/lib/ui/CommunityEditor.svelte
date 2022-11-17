<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Community} from '$lib/vocab/community/community';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import CommunitySettingsHue from '$lib/ui/CommunitySettingsHue.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
</script>

<div class="community-editor column markup">
	<form>
		<h2>Edit Community</h2>
		<section class="row" style:font-size="var(--font_size_xl)">
			<CommunityAvatar {community} />
		</section>
		<section>
			<p>created {format($community.created, 'PPPPp')}</p>
			{#if $community.updated !== null}
				<p>updated {format($community.updated, 'PPPPp')}</p>
			{/if}
		</section>
		<fieldset>
			<legend>settings</legend>
			<CommunitySettingsHue {persona} {community} />
		</fieldset>
	</form>
</div>

<style>
	/* TODO maybe extract .dialog-content */
	.community-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
</style>
