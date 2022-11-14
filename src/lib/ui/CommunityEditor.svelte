<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Community} from '$lib/vocab/community/community';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import CommunitySettingsHue from '$lib/ui/CommunitySettingsHue.svelte';
	import type {Persona} from '$lib/vocab/persona/persona';

	export let persona: Readable<Persona>;
	export let community: Readable<Community>;
</script>

<div class="community-editor column">
	<form>
		<legend>Edit Community</legend>
		<section class="row" style:font-size="var(--font_size_xl)">
			<CommunityAvatar {community} />
		</section>
		<section>
			<p>created {format($community.created, 'PPPPp')}</p>
			{#if $community.updated !== null}
				<p>updated {format($community.updated, 'PPPPp')}</p>
			{/if}
		</section>
	</form>
	<section>
		<CommunitySettingsHue {persona} {community} />
	</section>
</div>

<style>
	.community-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
</style>
