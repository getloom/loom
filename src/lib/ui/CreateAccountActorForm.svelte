<script lang="ts">
	import type {Async_Status} from '@ryanatkn/belt/async.js';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import Pending_Button from '@fuz.dev/fuz_library/Pending_Button.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions.js';
	import {getApp} from '$lib/ui/app.js';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url.js';
	import {scrubActorName, checkActorName} from '$lib/vocab/actor/actorHelpers.js';

	const {
		actions,
		ui: {sessionActorIndexById},
	} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let name = '';
	let status: Async_Status = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		name = scrubActorName(name);
		if (!name) {
			errorMessage = 'please enter a name for your new actor';
			nameEl.focus();
			return;
		}
		const nameErrorMessage = checkActorName(name);
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
					toAppSearchParams(
						$sessionActorIndexById.get(result.value.actors[0].actor_id),
						$page.url.searchParams,
					),
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

<!-- TODO these box classes -- ideally would have a single class or change the defaults,
maybe `form.box` should be interpreted a particular way in Felt? -->
<div class="prose padded_1 box">
	<form class="box" {...attrs}>
		<h2>Create a new Actor</h2>
		<fieldset class="box">
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
				<Alert status="error">{errorMessage}</Alert>
			{/if}
			<Pending_Button on:click={create} pending={status === 'pending'}>create actor</Pending_Button>
		</fieldset>
		<Alert icon="‼">your actor names are visible to people in the hubs you join</Alert>
	</form>
</div>
