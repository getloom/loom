<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {AsyncStatus} from '@feltcoop/util/async.js';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';
	import Message from '@feltcoop/felt/Message.svelte';

	import {autofocus} from '$lib/ui/actions';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	let status: AsyncStatus = 'initial'; // TODO refactor
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

<div class="markup panel padded-xl">
	<!-- TODO fix CommunityAvatar on newline-->
	<h1 class="row">
		Submit application to <CommunityAvatar {community} showName={true} contextmenuAction={null} />
	</h1>
	{#if !submitted}
		<form>
			<fieldset>
				<label>
					<div class="title">
						How did you find this community? If you were invited to join, who invited you?
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
					<div class="title">Why would you like to join this community?</div>
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
						These are the norms of our community, how do you think you can contribute?
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
				<Message status="error">{errorMessage}</Message>
			{/if}
			<PendingButton on:click={submit} pending={status === 'pending'}
				>submit application</PendingButton
			>
		</form>
	{:else}
		<section class="panel padded-xl">
			<p>
				Thank you for submitting! We will review your application and get back to you within a week.
				This process takes time because we want to ensure you and our community are a good fit.
			</p>
		</section>
	{/if}
</div>

<style>
	.panel {
		margin-top: var(--spacing_xl);
		margin-left: var(--spacing_xl);
		margin-right: var(--spacing_xl);
	}
</style>
