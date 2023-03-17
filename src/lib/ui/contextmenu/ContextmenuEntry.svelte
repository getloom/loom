<script lang="ts">
	import PendingAnimation from '@feltjs/felt-ui/PendingAnimation.svelte';

	import {getContextmenu, type ContextmenuRun} from '$lib/ui/contextmenu/contextmenu';

	export let run: ContextmenuRun; // is not reactive

	const contextmenu = getContextmenu();

	const entry = contextmenu.addEntry(run);

	const onMousemove = (e: MouseEvent) => {
		e.stopImmediatePropagation();
		contextmenu.select(entry);
	};

	// the `$contextmenu` is needed because `entry` is not reactive
	$: ({selected, pending, errorMessage} = $contextmenu && entry);
</script>

<!-- TODO should be <a> ? But they don't have a `href` currently which is an a11y warning -- should they?
https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-links.html
(in Chrome/FF contextmenus, `Tab` doesn't work, but maybe it should here?)
-->
<!-- disabling the a11y warning because a parent element handles keyboard events -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<li
	class="menu-item"
	role="menuitem"
	class:selected
	title={errorMessage ? `Error: ${errorMessage}` : undefined}
	on:click={() => {
		// This timeout lets event handlers react to the current DOM
		// before the item's changes are applied.
		setTimeout(() => contextmenu.activate(entry));
	}}
	on:mousemove={onMousemove}
>
	<div class="content">
		<div class="icon"><slot name="icon" /></div>
		<div class="title"><slot /></div>
		{#if pending}<PendingAnimation />{:else if errorMessage}⚠️{/if}
	</div>
</li>
