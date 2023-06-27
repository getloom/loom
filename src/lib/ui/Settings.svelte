<script lang="ts">
	import {defaultThemes} from '@feltjs/felt-ui/themes.js';
	import ColorSchemeInput from '@feltjs/felt-ui/ColorSchemeInput.svelte';
	import ThemeInput from '@feltjs/felt-ui/ThemeInput.svelte';
	import AccountEditor from '$lib/ui/AccountEditor.svelte';

	import {getApp} from '$lib/ui/app';

	const {
		ui: {account},
	} = getApp();
</script>

<div class="prose padded_xl box">
	<h1>Settings</h1>
	<h2>Color Scheme</h2>
	<ColorSchemeInput />
	<h2>Theme</h2>
	<ThemeInput themes={defaultThemes} />
	<AccountEditor {account} />
</div>
