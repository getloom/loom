<script lang="ts">
	import {base} from '$app/paths';

	import DocsGuideLinks from '$lib/docs/DocsGuideLinks.svelte';
	import {adminGuideItems, getDocsSettings} from '$lib/docs/docs';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div>
	<div class="prose">
		<h1>Admin guide</h1>
	</div>
	<DocsGuideLinks />
	<br />
	<slot>
		<div class="prose">
			<br />
			<p>These docs are a work in progress. Thank you for your patience!</p>
			<menu>
				{#each adminGuideItems as item}
					<li><a href="{base}{path}/guide/{item.slug}">{item.name}</a></li>
				{/each}
			</menu>
		</div>
	</slot>
</div>
