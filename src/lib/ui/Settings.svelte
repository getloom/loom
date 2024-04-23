<script lang="ts">
	import Color_Scheme_Input from '@ryanatkn/fuz/Color_Scheme_Input.svelte';
	import Theme_Input from '@ryanatkn/fuz/Theme_Input.svelte';

	import AccountEditor from '$lib/ui/AccountEditor.svelte';
	import {getApp} from '$lib/ui/app.js';

	const {
		ui: {account},
	} = getApp();
</script>

<div class="prose padded_1 box">
	<h1>Settings</h1>
	<h2>Color Scheme</h2>
	<Color_Scheme_Input />
	<h2>Theme</h2>
	<Theme_Input />
	<AccountEditor {account} />
</div>
