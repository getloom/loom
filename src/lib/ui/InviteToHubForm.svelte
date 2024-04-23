<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import type {Async_Status} from '@ryanatkn/belt/async.js';
	import {tick} from 'svelte';

	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {getApp} from '$lib/ui/app.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {autofocus} from '$lib/ui/actions.js';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let name = '';
	let status: Async_Status = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	const invite = async () => {
		if (!name) {
			errorMessage = 'please enter the name of the person to invite';
			nameEl.focus();
			return;
		}
		status = 'pending';
		const result = await actions.InviteToHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			name,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			done?.(); // TODO instead of closing, maybe show a success message and 2 buttons, invite more and OK
		} else {
			errorMessage = result.message;
			await tick(); // needed because the input is disabled while pending, but maybe it shouldn't be
			nameEl.focus();
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await invite();
		}
	};
</script>

<form class="prose padded_1" {...attrs}>
	<h2>Invite to Hub</h2>
	<ContextInfo {actor} {hub} />
	<fieldset>
		<label>
			<div class="title">actor name to invite</div>
			<input
				placeholder=">"
				bind:this={nameEl}
				bind:value={name}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/></label
		>
		{#if errorMessage}
			<Alert status="error">{errorMessage}</Alert>
		{/if}
		<Pending_Button on:click={invite} pending={status === 'pending'}>invite</Pending_Button>
	</fieldset>
</form>
