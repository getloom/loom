<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Alert from '@ryanatkn/fuz/Alert.svelte';

	import {getApp} from '$lib/ui/app.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';

	const {actions} = getApp();

	export let hub: Readable<Hub>;
	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let errorMessage: string | undefined;
	let pending = false;
	let lockText = '';
	$: locked = lockText.toLowerCase().trim() !== $hub.name.toLowerCase();

	const leaveHub = async () => {
		pending = true;
		errorMessage = '';
		const result = await actions.LeaveHub({
			actor: $actor.actor_id,
			actor_id: $actor.actor_id,
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
				await leaveHub();
			}
		}
	};
</script>

<form class="prose padded_1" {...attrs}>
	<h2>Leave Hub?</h2>
	<ContextInfo {actor} {hub} />
	<label>
		<div class="title">hub name</div>
		<input type="text" name="name" placeholder=">" bind:value={lockText} on:keydown={onKeydown} />
		<p>enter the hub name to unlock the leave button</p>
	</label>
	<Pending_Button {pending} disabled={locked || pending} on:click={leaveHub}>
		leave hub
	</Pending_Button>
	{#if errorMessage}
		<Alert status="error">{errorMessage}</Alert>
	{/if}
</form>
