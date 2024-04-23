<script lang="ts">
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error.js';

	export let text: string | undefined;

	$: errorMessage = text ?? ERROR_MESSAGE_UNKNOWN;
</script>

<div class="prose padded_1">
	<Alert status="error">Error: {errorMessage}</Alert>
</div>
