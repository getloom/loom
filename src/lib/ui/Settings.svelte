<script lang="ts">
	import ColorSchemeInput from '@fuz.dev/fuz/ColorSchemeInput.svelte';
	import ThemeInput from '@fuz.dev/fuz/ThemeInput.svelte';

	import AccountEditor from '$lib/ui/AccountEditor.svelte';
	import {getApp} from '$lib/ui/app.js';

	const {
		ui: {account},
	} = getApp();
</script>

<div class="prose padded_1 box">
	<h1>Settings</h1>
	<h2>Color Scheme</h2>
	<ColorSchemeInput />
	<h2>Theme</h2>
	<ThemeInput />
	<AccountEditor {account} />
</div>
