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

<div class="community-editor column">
	<form {...$$restProps} class="markup">
		<header>
			<h2>Edit Community</h2>
			<p style:font-size="var(--font_size_xl)">
				<CommunityAvatar {community} />
			</p>
			<section>
				<p>created {format($community.created, 'PPPPp')}</p>
				{#if $community.updated !== null}
					<p>updated {format($community.updated, 'PPPPp')}</p>
				{/if}
			</section>
		</header>
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
