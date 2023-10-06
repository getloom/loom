<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import type {ClientActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<ClientActor>;
</script>

<li class="menu_item" role="none">
	<div class="content">
		<div class="icon"><ActorAvatar {actor} showName={false} /></div>
		<div class="title"><ActorAvatar {actor} showIcon={false} /></div>
	</div>
</li>
