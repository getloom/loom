<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	//import type {AccountPersona} from '$lib/vocab/persona/persona';

	import type {Policy} from '$lib/vocab/policy/policy';

	//export let actor: Readable<AccountPersona>;
	export let permission: string;
	export let policy: Readable<Policy> | undefined;
</script>

<div>
	{#if $policy}
		✅ {$policy.permission}
	{:else}
		❌ {permission}
	{/if}
</div>
