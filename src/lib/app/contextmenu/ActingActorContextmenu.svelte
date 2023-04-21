<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CreateHubForm from '$lib/ui/CreateHubForm.svelte';
	import DeleteActorForm from '$lib/ui/DeleteActorForm.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<ActorAvatar {actor} showName={false} />
	</svelte:fragment>
	<ActorAvatar {actor} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: CreateHubForm,
					props: {actor, done: () => actions.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Create Hub
		</ContextmenuEntry>
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: DeleteActorForm,
					props: {actor, done: () => actions.CloseDialog()},
				})}
		>
			Delete Actor
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
