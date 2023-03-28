<script lang="ts">
	import type {AsyncStatus} from '@feltjs/util/async.js';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {toSearchParams, toHubUrl} from '$lib/ui/url';
	import {scrubPersonaName, checkPersonaName} from '$lib/vocab/actor/actorHelpers';

	const {
		actions,
		ui: {sessionPersonaIndexById},
	} = getApp();

	export let done: (() => void) | undefined = undefined;

	let name = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		name = scrubPersonaName(name);
		if (!name) {
			errorMessage = 'please enter a name for your new persona';
			nameEl.focus();
			return;
		}
		const nameErrorMessage = checkPersonaName(name);
		if (nameErrorMessage) {
			errorMessage = nameErrorMessage;
			nameEl.focus();
			return;
		}
		status = 'pending';
		const result = await actions.CreateAccountActor({name});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toHubUrl(
					result.value.hubs[0].name,
					null,
					toSearchParams($page.url.searchParams, {
						persona: $sessionPersonaIndexById.get(result.value.personas[0].persona_id) + '',
					}),
				),
			);
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<!-- TODO these centered classes -- ideally would have a single class or change the defaults,
maybe `form.centered` should be interpreted a particular way in Felt? -->
<div class="markup padded-xl centered">
	<form class="centered" {...$$restProps}>
		<h2>Create a new Persona</h2>
		<fieldset class="centered">
			<label>
				<div class="title">name</div>
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
				<Message status="error">{errorMessage}</Message>
			{/if}
			<PendingButton on:click={create} pending={status === 'pending'}>create persona</PendingButton>
		</fieldset>
		<Message icon="‼">your persona names are visible to people in the hubs you join</Message>
	</form>
</div>
