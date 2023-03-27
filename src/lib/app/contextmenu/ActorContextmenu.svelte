<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {ClientPersona} from '$lib/vocab/actor/persona';

	export let persona: Readable<ClientPersona>;
</script>

<li class="menu-item" role="none">
	<div class="content">
		<div class="icon"><ActorAvatar {persona} showName={false} /></div>
		<div class="title"><ActorAvatar {persona} showIcon={false} /></div>
	</div>
</li>
