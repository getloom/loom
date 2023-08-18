<script lang="ts">
	import Alert from '@feltjs/felt-ui/Alert.svelte';

	import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error';

	export let text: string | undefined;

	$: errorMessage = text ?? ERROR_MESSAGE_UNKNOWN;
</script>

<div class="prose padded_xl">
	<Alert status="error">Error: {errorMessage}</Alert>
</div>
