<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import {type ViewNode, toViewProps} from '$lib/vocab/view/view.js';

	const {
		ui: {components},
	} = getApp();

	export let view: ViewNode;

	$: props = toViewProps(view);
</script>

<!-- TODO can we format this without adding unwanted whitespace? -->
<!-- TODO is using keyed each blocks ideal here? maybe create an id for each node? -->
<!-- TODO should this render a fallback for unknown components? perhaps with a button to select a valid one? -->
{#if view.type === 'svelteComponent'}{#if view.tagName in components}{#if view.children.length}<svelte:component
				this={components[view.tagName]}
				{...props}
				>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:component
			>{:else}<svelte:component this={components[view.tagName]} {...props} />{/if}{:else}<code
			class="error_text">[unknown view: {view.tagName}]</code
		>{/if}{:else if view.type === 'svelteElement'}{#if view.children.length}<svelte:element
			this={view.tagName}
			{...props}
			>{#each view.children as child (child)}<svelte:self view={child} />{/each}</svelte:element
		>{:else}<svelte:element
			this={view.tagName}
			{...props}
		/>{/if}{:else if view.type === 'root'}{#each view.children as child (child)}<svelte:self
			view={child}
		/>{/each}{:else if view.type === 'text'}{view.value}{/if}
