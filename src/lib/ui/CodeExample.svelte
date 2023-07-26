<script lang="ts">
	// TODO implement syntax highlighting when felt-ui publishes 0.63
	// import Prism from 'prismjs';
	// import 'prism-svelte';

	// TODO move this
	// type PrismLang =
	// 	| 'plain'
	// 	| 'plaintext'
	// 	| 'text'
	// 	| 'txt'
	// 	| 'DFS'
	// 	| 'markup'
	// 	| 'html'
	// 	| 'mathml'
	// 	| 'svg'
	// 	| 'xml'
	// 	| 'ssml'
	// 	| 'atom'
	// 	| 'rss'
	// 	| 'css'
	// 	| 'clike'
	// 	| 'javascript'
	// 	| 'js'
	// 	| 'svelte';

	export let code: string;
	// export let lang: PrismLang = 'svelte';

	// $: grammar = Prism.languages[lang];

	// TODO do this at compile time somehow
	// $: highlighted = Prism.highlight(code, grammar, lang);
	$: highlighted = code;

	// TODO click to copy to clipboard, show floating button probably
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<pre class="code_example"><code>{@html highlighted}</code></pre>

<style>
	.code_example {
		background-color: var(--fg_1);
		border-radius: var(--border_radius_xs);
		padding: var(--spacing_xs3) var(--spacing_xs);
	}
	code {
		background-color: unset;
		/* the default `code` padding displays incorrectly wrapping the highlighted code */
		padding: 0;
	}
</style>
