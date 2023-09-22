<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Alert from '@fuz.dev/fuz/Alert.svelte';
	import PendingButton from '@fuz.dev/fuz/PendingButton.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Space} from '$lib/vocab/space/space';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {actions} = getApp();

	export let space: Readable<Space>;
	export let hub: Readable<Hub>;
	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let pending = false;
	export let attrs: any = undefined;

	let errorMessage: string | undefined;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $space.name.toLowerCase();

	const deleteSpace = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.DeleteSpace({
			actor: $actor.actor_id,
			space_id: $space.space_id,
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
				await deleteSpace();
			}
		}
	};
</script>

<div class="prose padded_xl">
	<form {...attrs}>
		<h2>Delete Space?</h2>
		<ContextInfo {actor} {hub} {space} />
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
		<PendingButton {pending} disabled={locked || pending} on:click={deleteSpace}>
			delete space
		</PendingButton>
	</form>
</div>
