<script lang="ts">
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';

	import {ERROR_MESSAGE_UNKNOWN} from '$lib/util/error';

	export let text: string | undefined;

	$: errorMessage = text ?? ERROR_MESSAGE_UNKNOWN;
</script>

<div class="prose padded_1">
	<Alert status="error">Error: {errorMessage}</Alert>
</div>
