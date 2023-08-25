<script lang="ts">
	import {page} from '$app/stores';
	import {base} from '$app/paths';
	import {stripStart} from '@feltjs/util/string.js';
	import {mutable, writable} from '@feltcoop/svelte-gettable-stores';

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
	import {
		clientActions,
		namesByCategory,
		serviceActions,
		sortedModelSchemas,
		sortedViewTemplates,
		type VocabCategory,
	} from '$lib/vocab/data';
	import type {VocabName} from '$lib/vocab/vocab';
	import {modelNames} from '$lib/vocab/metadata';

	export let path = '/docs';

	const docsSettings = setDocsSettings(writable({path}));
	$: if ($docsSettings.path !== path) $docsSettings = {path};

	// TODO improve how this component interacts with SvelteKit routing --
	// it's designed like this so it can be imported as a library component and keep the user's routing simple

	$: pathname = stripStart($page.url.pathname, base);

	// TODO display source code links to views and actions and such

	const vocabOnscreen = mutable(new Set<VocabName>()); // set of vocab names onscreen via IntersectionObserver

	const isCategoryOnscreen = (c: VocabCategory, $vocabOnscreen: Set<VocabName>): boolean => {
		const names = namesByCategory.get(c)!;
		for (const v of $vocabOnscreen) {
			if (names.has(v)) {
				return true;
			}
		}
		return false;
	};

	$: path_guide = path + '/guide';
	$: path_guide_user = path + '/guide/user';
	$: path_guide_admin = path + '/guide/admin';
	$: path_guide_dev = path + '/guide/dev';
	$: path_vocab = path + '/vocab';

	$: title =
		pathname === path_guide
			? 'felt guide'
			: pathname === path_guide_user
			? 'felt user guide'
			: pathname === path_guide_admin
			? 'felt admin guide'
			: pathname === path_guide_dev
			? 'felt dev guide'
			: pathname === path_vocab
			? 'felt vocab docs'
			: 'felt docs';

	$: showGuideContent = pathname.startsWith(path_guide);
	$: showVocabContent = pathname.startsWith(path_vocab);

	const toGuideSlug = (p: string, path: string): string | null => {
		const guidePrefix = path + '/guide/';
		if (!p.startsWith(guidePrefix)) return null;
		return stripStart(p, guidePrefix);
	};
	$: guideSlug = toGuideSlug(pathname, path);
	$: selectedGuideItem = guideSlug ? guideItemsBySlug.get(guideSlug) : null;
</script>

<svelte:head><title>{title}</title></svelte:head>

<div class="wrapper">
	<!-- TODO extract an accessible menu component, see PRS
	https://github.com/feltjs/felt/pull/362
	and https://github.com/feltjs/felt-ui/pull/197 -->
	<div class="sidebar padded_xl width_sm">
		<slot name="header"><header>@feltjs/felt</header></slot>
		<nav>
			<h2><a href="{base}{path}" class:selected={pathname === path}>docs</a></h2>
			<h3><a href="{base}{path_guide}" class:selected={showGuideContent}>guide</a></h3>
			<h4>
				<a href="{base}{path_guide_user}" class:selected={pathname.startsWith(path_guide_user)}>
					user
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each userGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path_guide_admin}" class:selected={pathname.startsWith(path_guide_admin)}>
					admin
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each adminGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}
			<h4>
				<a href="{base}{path_guide_dev}" class:selected={pathname.startsWith(path_guide_dev)}>
					dev
				</a>
			</h4>
			{#if showGuideContent}
				<ol>
					{#each devGuideItems as guideItem}
						<li>
							<a
								class:selected={guideItem === selectedGuideItem}
								href="{base}{path_guide}/{guideItem.slug}">{guideItem.name}</a
							>
						</li>
					{/each}
				</ol>
			{/if}

			<h3><a href="{base}{path_vocab}#vocab" class:selected={showVocabContent}>vocab</a></h3>
			{#if showVocabContent}
				<h4>
					<a
						href="{base}{path_vocab}#views"
						class:selected={isCategoryOnscreen('views', $vocabOnscreen.value)}>views</a
					>
				</h4>
				<menu>
					{#each sortedViewTemplates as { name }}
						<li>
							<Vocab {name} plain={true} selections={vocabOnscreen} />
						</li>
					{/each}
				</menu>
				<h4>
					<a
						href="{base}{path_vocab}#models"
						class:selected={isCategoryOnscreen('models', $vocabOnscreen.value)}>models</a
					>
				</h4>
				<menu>
					{#each modelNames as name}
						<li>
							<Vocab {name} plain={true} selections={vocabOnscreen} />
						</li>
					{/each}
				</menu>
				<h4>
					<a
						href="{base}{path_vocab}#service_actions"
						class:selected={isCategoryOnscreen('service_actions', $vocabOnscreen.value)}
						>service actions</a
					>
				</h4>
				<menu>
					{#each serviceActions as { name } (name)}
						<li>
							<Vocab {name} plain={true} selections={vocabOnscreen} />
						</li>
					{/each}
				</menu>
				<h4>
					<a
						href="{base}{path_vocab}#client_actions"
						class:selected={isCategoryOnscreen('client_actions', $vocabOnscreen.value)}
						>client actions</a
					>
				</h4>
				<menu>
					{#each clientActions as { name } (name)}
						<li>
							<Vocab {name} plain={true} selections={vocabOnscreen} />
						</li>
					{/each}
				</menu>
			{/if}
		</nav>
		<footer>
			<slot name="footer">
				<div class="prose">
					<p class="text_align_center width_full" style:margin-top="var(--spacing_sm)">
						<a href="{base}/">back home</a>
					</p>
					<div class="text_align_center">@feltjs/felt</div>
					<div class="links">
						<a href="https://github.com/feltjs/felt">GitHub</a>∙<a
							href="https://npmjs.com/@feltjs/felt-server">npm</a
						>∙<a href="https://www.felt.dev">felt.dev</a>
					</div>
				</div>
			</slot>
		</footer>
	</div>
	<div class="content">
		<!--
			TODO this is hacky routing but IDK how to better integrate with SvelteKit
			for this usecase mounting Docs from a library to handle multiple routes
		-->
		<slot>
			{#if pathname === path}
				<div class="prose">
					<h1>Docs</h1>
				</div>
				<DocsContent />
			{:else if pathname === path_guide}
				<DocsGuideContent />
			{:else if pathname === path_guide_user}
				<DocsGuideUserContent />
			{:else if pathname === path_guide_admin}
				<DocsGuideAdminContent />
			{:else if pathname === path_guide_dev}
				<DocsGuideDevContent />
			{:else if pathname === path_vocab}
				<DocsVocabContent
					{sortedViewTemplates}
					{sortedModelSchemas}
					{serviceActions}
					{clientActions}
					{modelNames}
					selections={vocabOnscreen}
				/>
			{:else if selectedGuideItem}
				{#if pathname.startsWith(path_guide_user + '/')}
					<DocsGuideUserContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideUserContent
					>
				{:else if pathname.startsWith(path_guide_admin + '/')}
					<DocsGuideAdminContent
						><svelte:component this={selectedGuideItem.component} /></DocsGuideAdminContent
					>
				{:else if pathname.startsWith(path_guide_dev + '/')}
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
	}
	.sidebar {
		height: 100%;
		overflow: auto;
	}
	header {
		margin-bottom: var(--spacing_md);
		padding: var(--spacing_sm);
	}
	nav {
		flex-direction: column;
	}
	nav li {
		padding: 0;
	}
	/* TODO hacky, gets the `Vocab` */
	nav :global(a) {
		border-radius: var(--border_radius_xs);
		padding: var(--spacing_xs3) var(--spacing_sm);
	}
	nav :global(a:not(:hover)) {
		--text_decoration_selected: none;
	}
	nav h3 a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
	nav h2 a {
		padding: var(--spacing_xs) var(--spacing_sm);
	}
	/* TODO hacky, gets the `Vocab` */
	nav :global(a.selected) {
		background-color: var(--fg_1);
	}
	@media (max-width: 1500px) {
		.sidebar {
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
		padding: var(--spacing_sm);
		margin: var(--spacing_xl5) 0;
	}
	.links {
		display: flex;
		justify-content: center;
		margin: var(--spacing_sm) 0;
	}
	footer a {
		padding: var(--spacing_xs2) var(--spacing_sm);
	}
</style>
