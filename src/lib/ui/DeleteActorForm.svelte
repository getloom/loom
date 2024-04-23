<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';

	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let pending = false;
	export let attrs: any = undefined;

	let errorMessage: string | undefined;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $actor.name.toLowerCase();

	const deleteActor = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.DeleteActor({
			actor: $actor.actor_id,
			actor_id: $actor.actor_id,
		});
		if (result.ok) {
			done?.();
		} else {
			errorMessage = result.message;
		}
		pending = false;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (!locked) {
				await deleteActor();
			}
		}
	};
</script>

<form class="prose padded_1" {...attrs}>
	<h2>Delete <ActorAvatar {actor} inline={true} />?</h2>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
	<input
		type="text"
		name="name"
		placeholder=">enter name to unlock button"
		bind:value={lockText}
		on:keydown={onKeydown}
	/>
	<Pending_Button {pending} disabled={locked || pending} on:click={deleteActor}>
		delete actor
	</Pending_Button>
</form>
