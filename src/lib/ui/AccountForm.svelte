<script lang="ts">
	import SignInForm from '$lib/ui/SignInForm.svelte';
	import SignUpForm from '$lib/ui/SignUpForm.svelte';
	import SignOutForm from '$lib/ui/SignOutForm.svelte';
	import HelpButton from '$lib/ui/HelpButton.svelte';

	export let guest: boolean;
	export let attrs: any = undefined;

	let username = import.meta.env.DEV ? 'a@a.a' : ''; // share the username between the SignIn and SignUp forms for better UX

	let view: 'sign_in' | 'sign_up' = 'sign_in'; // TODO likely add "forgot_password"
</script>

{#if guest}
	{#if view === 'sign_in'}
		<SignInForm {...attrs} bind:username>
			<div class="box">
				<button on:click={() => (view = 'sign_up')}>sign up</button>
				<HelpButton />
			</div>
		</SignInForm>
	{:else if view === 'sign_up'}
		<SignUpForm {...attrs} bind:username>
			<div class="box">
				<button on:click={() => (view = 'sign_in')}>sign in</button>
				<HelpButton />
			</div>
		</SignUpForm>
	{/if}
{:else}
	<SignOutForm {...attrs} />
{/if}
