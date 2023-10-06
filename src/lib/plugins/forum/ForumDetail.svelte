<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {page} from '$app/stores';

	import type {Entity} from '$lib/vocab/entity/entity.js';
	import ForumItemDetail from '$lib/plugins/forum/ForumItemDetail.svelte';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {toHubUrl} from '$lib/util/url.js';

	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let actor: Readable<AccountActor>;
	export let selectedPost: Readable<Entity>;

	// TODO helper with better change detection
	$: href = toHubUrl($hub.name, '/' + $space.name, $page.url.search);
</script>

<div class="box"><a {href} class="padded_xs">go back</a></div>
<div class="forum_detail">
	<ForumItemDetail entity={selectedPost} {space} {actor} />
</div>

<style>
	.forum_detail {
		padding: var(--spacing_md);
	}
</style>
