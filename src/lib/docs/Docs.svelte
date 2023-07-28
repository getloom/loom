<script lang="ts">
	import {page} from '$app/stores';
	import {base} from '$app/paths';
	import {stripStart} from '@feltjs/util/string.js';
	import Breadcrumbs from '@feltjs/felt-ui/Breadcrumbs.svelte';
	import {writable} from '@feltcoop/svelte-gettable-stores';

	import {actionDatas} from '$lib/vocab/action/actionData';
	import {modelSchemas} from '$lib/vocab/schemas';
	import {viewTemplates} from '$lib/vocab/view/view';
	import {toSchemaName} from '$lib/util/schema';
	import Vocab from '$lib/plugins/vocab/Vocab.svelte';
	import {
		guideItemsBySlug,
		userGuideItems,
		adminGuideItems,
		devGuideItems,
		setDocsSettings,
	} from '$lib/docs/docs';
	import DocsContent from '$lib/docs/DocsContent.svelte';
	import DocsGuideContent from '$lib/docs/DocsGuideContent.svelte';
	import DocsGuideUserContent from '$lib/docs/DocsGuideUserContent.svelte';
	import DocsGuideAdminContent from '$lib/docs/DocsGuideAdminContent.svelte';
	import DocsGuideDevContent from '$lib/docs/DocsGuideDevContent.svelte';
	import DocsVocabContent from '$lib/docs/DocsVocabContent.svelte';
	import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action';

	export let path = '/docs';

	const docsSettings = setDocsSettings(writable({path}));
	$: if ($docsSettings.path !== path) $docsSettings = {path};

	// TODO improve how this component interacts with SvelteKit routing --
	// it's designed like this so it can be imported as a library component and keep the user's routing simple

	$: ({pathname} = $page.url);
	$: basePathname = stripStart(pathname, base);

	$: hash = $page.url.hash.substring(1);

	// TODO display source code links to views and actions and such

	const sortedModelSchemas = modelSchemas.slice().sort((a, b) => a.$id.localeCompare(b.$id));
	const sortedViewTemplates = viewTemplates.slice().sort((a, b) => a.name.localeCompare(b.name));
	const clientActions = actionDatas
		.filter((a) => a.type === 'ClientAction')
		.sort((a, b) => a.name.localeCompare(b.name)) as ClientActionData[];
	const serviceActions = actionDatas
		.filter((a) => a.type === 'ServiceAction')
		.sort((a, b) => a.name.localeCompare(b.name)) as ServiceActionData[];

	const schemaNames = sortedModelSchemas.map((s) => toSchemaName(s.$id));

	$: path_guide = path + '/guide';
	$: path_guide_user = path + '/guide/user';
	$: path_guide_admin = path + '/guide/admin';
	$: path_guide_dev = path + '/guide/dev';
	$: path_vocab = path + '/vocab';

	$: title =
		basePathname === path_guide
			? 'felt guide'
			: basePathname === path_guide_user
			? 'felt user guide'
			: basePathname === path_guide_admin
			? 'felt admin guide'
			: basePathname === path_guide_dev
			? 'felt dev guide'
			: basePathname === path_vocab
			? 'felt vocab docs'
			: 'felt docs';

	$: showGuideContent = basePathname.startsWith(path_guide);
	$: showVocabContent = basePathname.startsWith(path_vocab);

	const toGuideSlug = (p: string, path: string): string | null => {
		const guidePrefix = path + '/guide/';
		if (!p.startsWith(guidePrefix)) return null;
		return stripStart(p, guidePrefix);
	};
	$: guideSlug = toGuideSlug(basePathname, path);
	$: selectedGuideItem = guideSlug ? guideItemsBySlug.get(guideSlug) : null;
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/feltjs/felt-server/pull/362
	and https://github.com/feltjs/felt-ui/pull/197 -->
	<div class="nav-wrapper prose padded_xl width_sm">
		<nav>
			<h2><a href="{base}{path}" class:selected={basePathname === path}>docs</a></h2>
			<h3><a href="{base}{path}/guide" class:selected={showGuideContent}>guide</a></h3>
			<h4>
				<a href="{base}{path}/guide/user" class:selected={basePathname === path_guide_user}>
					user
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each userGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path}/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path}/guide/admin" class:selected={basePathname === path_guide_admin}>
					admin
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each adminGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path}/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path}/guide/dev" class:selected={basePathname === path_guide_dev}> dev </a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each devGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path}/guide/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}

			<h3><a href="{base}{path}/vocab#vocab" class:selected={showVocabContent}>vocab</a></h3>
			{#if showVocabContent}
				<h4><a href="{base}{path}/vocab/#views" class:selected={hash === 'views'}>views</a></h4>
				<menu>
					{#each sortedViewTemplates as viewTemplate}
						<li>
							<a href="#{viewTemplate.name}" class:selected={hash === viewTemplate.name}
								>{viewTemplate.name}</a
							>
						</li>
					{/each}
				</menu>
				<h4><a href="{base}{path}/vocab/#models" class:selected={hash === 'models'}>models</a></h4>
				<menu>
					{#each schemaNames as name}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
				<h4>
					<a href="{base}{path}/vocab/#service_actions" class:selected={hash === 'service_actions'}
						>service actions</a
					>
				</h4>
				<menu>
					{#each serviceActions as { name } (name)}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
				<h4>
					<a href="{base}{path}/vocab/#client_actions" class:selected={hash === 'client_actions'}
						>client actions</a
					>
				</h4>
				<menu>
					{#each clientActions as { name } (name)}
						<li>
							<Vocab {name} selected={hash === name} plain={true} />
						</li>
					{/each}
				</menu>
			{/if}
			<footer>
				<Breadcrumbs>💚</Breadcrumbs>
				<div class="links">
					<a href="https://github.com/feltjs/felt-server">GitHub</a>∙<a
						href="https://npmjs.com/@feltjs/felt-server">npm</a
					>∙<a href="https://www.felt.dev">felt.dev</a>
				</div>
			</footer>
		</nav>
	</div>
	<div class="content">
		<slot>
			{#if basePathname === path}
				<div class="prose">
					<h1>Docs</h1>
				</div>
				<DocsContent />
			{:else if basePathname === path_guide}
				<DocsGuideContent />
			{:else if basePathname === path_guide_user}
				<DocsGuideUserContent />
			{:else if basePathname === path_guide_admin}
				<DocsGuideAdminContent />
			{:else if basePathname === path_guide_dev}
				<DocsGuideDevContent />
			{:else if basePathname === path_vocab}
				<DocsVocabContent
					{sortedViewTemplates}
					{sortedModelSchemas}
					{serviceActions}
					{clientActions}
					{schemaNames}
				/>
			{:else if selectedGuideItem}
				{#if basePathname.startsWith(path_guide_user + '/')}
					<DocsGuideUserContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideUserContent
					>
				{:else if basePathname.startsWith(path_guide_admin + '/')}
					<DocsGuideAdminContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideAdminContent
					>
				{:else if basePathname.startsWith(path_guide_dev + '/')}
					<DocsGuideDevContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideDevContent
					>
				{/if}
			{/if}
		</slot>
	</div>
</div>

<style>
	.wrapper {
		width: 100%;
		height: 100%;
		position: relative;
		display: flex;
	}
	.content {
		width: 100%;
		max-width: var(--width_md);
		position: relative;
		overflow: auto;
		flex: 1;
		padding: var(--spacing_md);
	}
	ol,
	menu {
		padding-left: var(--spacing_xl6);
	}
	li {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl3) 0;
	}
	nav li {
		padding: 0;
	}
	.nav-wrapper {
		height: 100%;
		overflow: auto;
	}
	nav {
		position: sticky;
		top: 0;
		right: 0;
		padding: var(--spacing_sm);
		flex-direction: column;
	}
	@media (max-width: 1500px) {
		.nav-wrapper {
			position: relative;
			transform: none;
			margin-bottom: var(--spacing_xl3);
		}
	}
	menu {
		margin-bottom: var(--spacing_lg);
	}
	h4 {
		padding-left: var(--spacing_xl3);
	}
	footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: var(--fg_1);
		border-radius: var(--border_radius_sm);
		padding: var(--spacing_md);
		margin: var(--spacing_xl5) 0;
	}
	footer .links {
		margin: var(--spacing_sm) 0;
	}
	footer a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
</style>
