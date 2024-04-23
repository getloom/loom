<script lang="ts">
	import Package_Summary from '@ryanatkn/fuz/Package_Summary.svelte';
	import {parse_package_meta} from '@ryanatkn/fuz/package_meta.js';

	import {package_json, src_json} from '$lib/package.js';

	const pkg = parse_package_meta(package_json.homepage, package_json, src_json);
</script>

<section class="prose spaced">
	<h2>Introduction to Loom</h2>
	<p>
		These docs are currently a work in progress. For the project overview see <a
			href="https://www.getloom.org/">getloom.org</a
		>.
	</p>
</section>
<section class="padded">
	<div class="width_sm panel">
		<Package_Summary {pkg} />
	</div>
</section>
