<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';

	import {getApp} from '$lib/ui/app';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import PendingButton from '@fuz.dev/fuz_library/PendingButton.svelte';

	const {actions} = getApp();

	export let hub: Readable<Hub>;
	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let errorMessage: string | undefined;
	let pending = false;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $hub.name.toLowerCase();

	const deleteHub = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.DeleteHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
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
				await deleteHub();
			}
		}
	};
</script>

<form class="prose padded_1" {...attrs}>
	<h2>Delete Hub?</h2>
	<ContextInfo {actor} {hub} />
	<label>
		<div class="title">hub name</div>
		<input type="text" name="name" placeholder=">" bind:value={lockText} on:keydown={onKeydown} />
		<p>enter the hub name to unlock the delete button</p>
	</label>
	<PendingButton {pending} disabled={locked || pending} on:click={deleteHub}>
		delete hub
	</PendingButton>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</form>
