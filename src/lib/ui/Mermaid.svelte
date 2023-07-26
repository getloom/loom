<script lang="ts" context="module">
	import mermaid from 'mermaid';

	mermaid.initialize({startOnLoad: false});
</script>

<script lang="ts">
	import {browser} from '$app/environment';

	export let content: string;

	let el: HTMLElement;

	$: browser && content && el && void mermaid.run({nodes: [el]});
</script>

<pre bind:this={el}>{content}</pre>
