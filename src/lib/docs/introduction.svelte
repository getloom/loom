<script lang="ts">
	import PackageSummary from '@fuz.dev/fuz_library/PackageSummary.svelte';
	import {parse_package_meta} from '@fuz.dev/fuz_library/package_meta.js';

	import {package_json} from '$lib/package.js';

	const pkg = parse_package_meta(package_json.homepage, package_json);
</script>

<section class="prose spaced">
	<h2>Introduction to Felt</h2>
	<p>
		These docs are currently a work in progress. For the project overview see <a
			href="https://www.felt.dev/">felt.dev</a
		>.
	</p>
</section>
<section class="padded">
	<div class="width_sm panel">
		<PackageSummary {pkg} />
	</div>
</section>
