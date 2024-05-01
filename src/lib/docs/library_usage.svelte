<script lang="ts">
	import {base} from '$app/paths';

	import CodeExample from '$lib/ui/CodeExample.svelte';
	import {getDocsSettings} from '$lib/docs/docs.js';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<section class="prose spaced">
	<h2>Using Loom as a library</h2>
	<blockquote>support for this coming soon - it's published to npm but not yet usable</blockquote>
	<p>
		<code>@getloom/loom</code> can be installed as
		<a href="https://www.npmjs.com/package/@getloom/loom">an npm library</a>
		to make custom servers.
	</p>
	<p>
		First, follow the <a href="{base}{path}/guide/admin/getting-started">getting started</a> instructions.
	</p>
	<p>Next install Loom as a dev dependency:</p>
	<CodeExample code="npm i -D @getloom/loom" />
</section>
