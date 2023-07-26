<script lang="ts">
	import {base} from '$app/paths';

	import DocsGuideLink from '$lib/docs/DocsGuideLink.svelte';
	import {adminGuideItems} from '$lib/docs/guide';
</script>

<div>
	<div class="prose">
		<h1>Admin guide</h1>
	</div>
	<DocsGuideLink guide="admin" />
	<br />
	<slot>
		<div class="prose">
			<br />
			<p>These docs are a work in progress. Thank you for your patience!</p>
			<menu>
				{#each adminGuideItems as item}
					<li><a href="{base}/docs/guide/{item.slug}">{item.name}</a></li>
				{/each}
			</menu>
		</div>
	</slot>
</div>
