<script lang="ts">
	import {base} from '$app/paths';

	import DocsGuideLinks from '$lib/docs/DocsGuideLinks.svelte';
	import {devGuideItems, getDocsSettings} from '$lib/docs/docs.js';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div>
	<div class="prose">
		<h1>Dev guide</h1>
	</div>
	<DocsGuideLinks />
	<br />
	<slot>
		<div class="prose">
			<br />
			<p>These docs are a work in progress. Thank you for your patience!</p>
			<menu>
				{#each devGuideItems as item}
					<li><a href="{base}{path}/guide/{item.slug}">{item.name}</a></li>
				{/each}
			</menu>
		</div>
	</slot>
</div>
