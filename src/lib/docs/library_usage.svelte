<script lang="ts">
	import {base} from '$app/paths';

	import CodeExample from '$lib/ui/CodeExample.svelte';
	import {getDocsSettings} from '$lib/docs/docs';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div class="prose">
	<h2>Using felt as a library</h2>
	<blockquote>support for this coming soon - it's published to npm but not yet usable</blockquote>
	<p>
		<code>@feltjs/felt</code> can be installed as
		<a href="https://www.npmjs.com/package/@feltjs/felt-server">an npm library</a>
		to make custom servers.
	</p>
	<p>
		First, follow the <a href="{base}{path}/guide/admin/getting-started">getting started</a> instructions.
	</p>
	<p>Next install felt-server as a dev dependency:</p>
	<CodeExample code="npm i -D @feltjs/felt-server" />
	<p>
		See the available modules at <a
			href="https://github.com/feltjs/felt/tree/main/src/gro.config.ts"
			><code>/src/gro.config.ts</code></a
		>
	</p>
	<p>
		For more, see the <a href="https://github.com/feltjs/felt"
			><code>@feltjs/felt</code> docs on GitHub</a
		>.
	</p>
</div>
