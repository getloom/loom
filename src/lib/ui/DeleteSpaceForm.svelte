<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';

	import {getApp} from '$lib/ui/app.js';
	import type {Space} from '$lib/vocab/space/space.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
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

<div class="prose padded_1">
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
		<Pending_Button {pending} disabled={locked || pending} on:click={deleteSpace}>
			delete space
		</Pending_Button>
	</form>
</div>
