<script lang="ts">
	import {base} from '$app/paths';

	import {getDocsSettings} from '$lib/docs/docs';
	import tech_stack_diagram from '$lib/docs/tech_stack_diagram.png';

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
</script>

<div class="prose">
	<h2>Getting started with <code>@feltjs/felt</code></h2>
	<blockquote>
		docs for devs and operators of <a href="https://github.com/feltjs/felt"
			><code>@feltjs/felt</code></a
		>, a programmable platform for hobbyists and human-scale communities 💚
	</blockquote>
	<p>
		Looking for instructions for how to use this project as a library? See <a
			href="{base}{path}/guide/dev/library-usage">library-usage</a
		>.
	</p>
	<p>
		Problems? We track <a href="https://github.com/feltjs/felt">open issues</a> on GitHub and
		<a href="{base}{path}/guide/user/known-issues">known issues</a> in the docs.
	</p>
	<h3>Overview</h3>

	<p>
		<code>@feltjs/felt</code> depends on the following software:
	</p>
	<ul>
		<li><a href="https://nodejs.org/">Node</a></li>
		<li>
			<a href="https://www.postgresql.org/">PostgreSQL</a> using the
			<a href="https://www.npmjs.com/package/postgres"><code>postgres</code></a> driver
		</li>
		<li>
			<a href="https://svelte.dev/">Svelte</a> and <a href="https://kit.svelte.dev/">SvelteKit</a>
		</li>
		<li><a href="https://www.typescriptlang.org/">TypeScript</a></li>
	</ul>

	<h3>tech stack diagram</h3>
	<img alt="the tech stack diagram" src={tech_stack_diagram} />

	<h3>Setup</h3>
	<p>
		Set up <a href="{base}{path}/guide/dev/setup-dev-environment">a local dev environment</a>.
	</p>

	<h3>Developing</h3>

	<p>
		In most cases <a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/dev.md"
			><code>gro dev</code></a
		>
		is the main command you'll need to run during development. It starts both SvelteKit and an API server,
		and when files change the system should automatically update or restart as needed. See
		<a href="https://github.com/grogarden/gro">Gro's docs</a> for more.
	</p>

	<h3>Manual dev processes</h3>

	<p>There's two manual steps that you may sometimes need to perform:</p>

	<h4><code>gro format</code></h4>
	<p>
		Gro integrates formatting with <a href="https://github.com/prettier/prettier">Prettier</a>.
		<a href="https://github.com/feltjs/felt/blob/main/.github/workflows/check.yml"
			>This project's CI</a
		>
		runs <code>gro check</code> which runs <code>gro format --check</code> which fails if any files
		are unformatted. You can manually format the project with <code>gro format</code>, and if you're
		using VSCode,
		<a href="https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode"
			>the Prettier extension</a
		>
		combined with the setting <code>"editor.formatOnSave": true</code> should take care of formatting
		automatically.
	</p>
	<h4><code>gro gen</code></h4>

	<p>
		Gro provides the <a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/gen.md"
			><code>gro gen</code></a
		>
		task to make it easier to derive data and other files from single sources of truth. It currently
		has a limitation where it does not run automatically - the developer is expected to run
		<code>gro gen</code> when things change.
	</p>
	<p>
		<a href="https://github.com/feltjs/felt/blob/main/.github/workflows/check.yml"
			>This project's CI</a
		>
		runs <code>gro check</code> which runs
		<code>gro gen --check</code>
		which fails if any generated files have changed, to help ensure that the committed files remain in
		sync.
	</p>
	<blockquote>
		The files that <code>gro gen</code> outputs are formatted automatically when possible, so there's
		no need to get things perfect.
	</blockquote>

	<h3>Building</h3>

	<p>
		The <a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/build.md"
			><code>gro build</code></a
		>
		command outputs artifacts to the gitignored <code>/dist</code> directory, which can then
		deployed to production and published to a package registry like npm. For SvelteKit projects,
		<code>gro build</code>
		wraps
		<code>svelte-kit build</code>, and it also produces directories for each of
		<a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/config.md"
			>Gro's configured production builds</a
		>. See
		<a href="https://github.com/grogarden/gro/blob/main/src/lib/docs/build.md">Gro's build docs</a> for
		more.
	</p>

	<h3>Deploying</h3>
	<ul>
		<li>
			<a href="{base}{path}/guide/admin/setup-production"
				><code>guide/admin/setup-production</code></a
			>
		</li>
		<li>
			<a href="{base}{path}/guide/admin/deploying-production"
				><code>guide/admin/deploying-production</code></a
			>
		</li>
		<li>
			<a href="{base}{path}/guide/admin/managing-production"
				><code>guide/admin/managing-production</code></a
			>
		</li>
		<li></li>
	</ul>
</div>
