<script lang="ts">
	import {base} from '$app/paths';
	import Package_Detail from '@fuz.dev/fuz_library/Package_Detail.svelte';
	import {parse_package_meta} from '@fuz.dev/fuz_library/package_meta.js';

	import CodeExample from '$lib/ui/CodeExample.svelte';
	import {getDocsSettings} from '$lib/docs/docs.js';
	import {package_json, src_json} from '$lib/package.js';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);

	const pkg = parse_package_meta(package_json.homepage, package_json, src_json);
</script>

<section class="prose spaced">
	<h2>Using Felt as a library</h2>
	<blockquote>support for this coming soon - it's published to npm but not yet usable</blockquote>
	<p>
		<code>@feltjs/felt</code> can be installed as
		<a href="https://www.npmjs.com/package/@feltjs/felt">an npm library</a>
		to make custom servers.
	</p>
	<p>
		First, follow the <a href="{base}{path}/guide/admin/getting-started">getting started</a> instructions.
	</p>
	<p>Next install Felt as a dev dependency:</p>
	<CodeExample code="npm i -D @feltjs/felt" />
</section>
<section class="panel padded">
	<Package_Detail {pkg} />
</section>
