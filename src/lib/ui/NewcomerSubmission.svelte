<script lang="ts">
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {Async_Status} from '@ryanatkn/belt/async.js';
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import {autofocus} from '$lib/ui/actions.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	const {hub} = getSpaceContext();

	export let actor: Readable<AccountActor>;

	let status: Async_Status = 'initial'; // TODO refactor
	let submitted = false;
	let errorMessage: string | null = null;

	//TODO refactor to build form from stored collection of questions stored as entities
	let q1 = '';
	let q2 = '';
	let q3 = '';
	let q1El: HTMLInputElement;
	let q2El: HTMLInputElement;
	let q3El: HTMLInputElement;

	const submit = async () => {
		//TODO validate inputs
		errorMessage = '';
		status = 'pending';
		q1 = q1.trim();
		q2 = q2.trim();
		q3 = q3.trim();
		if (!q1) {
			errorMessage = 'please answer all questions';
			q1El.focus();
			status = 'initial';
			return;
		}
		if (!q2) {
			errorMessage = 'please answer all questions';
			q2El.focus();
			status = 'initial';
			return;
		}
		if (!q3) {
			errorMessage = 'please answer all questions';
			q3El.focus();
			status = 'initial';
			return;
		}
		//TODO actually submit a form to the server for downstream review
		status = 'success';
		submitted = true;
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await submit();
		}
	};
</script>

<div class="prose panel padded_1">
	<!-- TODO fix HubAvatar on newline-->
	<h1 class="row">
		Submit application to <HubAvatar {actor} {hub} showName={true} contextmenuParams={null} />
	</h1>
	{#if !submitted}
		<form>
			<fieldset>
				<label>
					<div class="title">
						How did you find this hub? If you were invited to join, who invited you?
					</div>
					<input
						placeholder=">"
						bind:this={q1El}
						bind:value={q1}
						use:autofocus
						disabled={status === 'pending'}
						on:keydown={onKeydown}
					/>
				</label>
			</fieldset>
			<fieldset>
				<label>
					<div class="title">Why would you like to join this hub?</div>
					<input
						placeholder=">"
						bind:this={q2El}
						bind:value={q2}
						use:autofocus
						disabled={status === 'pending'}
						on:keydown={onKeydown}
					/>
				</label>
			</fieldset>
			<fieldset>
				<label>
					<div class="title">
						These are the norms of our hub, how do you think you can contribute?
					</div>
					<!--TODO discuss a good way to reference the "rules" entity in another space-->
					<input
						placeholder=">"
						bind:this={q3El}
						bind:value={q3}
						use:autofocus
						disabled={status === 'pending'}
						on:keydown={onKeydown}
					/>
				</label>
			</fieldset>
			{#if errorMessage}
				<Alert status="error">{errorMessage}</Alert>
			{/if}
			<Pending_Button on:click={submit} pending={status === 'pending'}
				>submit application</Pending_Button
			>
		</form>
	{:else}
		<section class="panel padded_1">
			<p>
				Thank you for submitting! We will review your application and get back to you within a week.
				This process takes time because we want to ensure you and our hub are a good fit.
			</p>
		</section>
	{/if}
</div>

<style>
	.panel {
		margin-top: var(--spacing_1);
		margin-left: var(--spacing_1);
		margin-right: var(--spacing_1);
	}
</style>
