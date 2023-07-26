<script lang="ts">
	import DocsGuideLink from '$lib/docs/DocsGuideLink.svelte';
</script>

<div class="prose">
	<p>I am a...</p>
	<br />
</div>
<ul class="docs_content">
	<li><DocsGuideLink guide="user" /></li>
	<li><DocsGuideLink guide="admin" /></li>
	<li><DocsGuideLink guide="dev" /></li>
</ul>

<style>
	.docs_content {
		display: flex;
		gap: var(--spacing_md);
	}
	li {
		display: contents;
	}
</style>
