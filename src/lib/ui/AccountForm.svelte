<script lang="ts">
	import SignInForm from '$lib/ui/SignInForm.svelte';
	import SignUpForm from '$lib/ui/SignUpForm.svelte';
	import SignOutForm from '$lib/ui/SignOutForm.svelte';

	export let guest: boolean;

	let username = ''; // share the username between the SignIn and SignUp forms for better UX

	let view: 'sign_in' | 'sign_up' = 'sign_in'; // TODO likely add "forgot_password"
</script>

{#if guest}
	{#if view === 'sign_in'}
		<SignInForm bind:username>
			<button on:click={() => (view = 'sign_up')}>sign up</button>
		</SignInForm>
	{:else if view === 'sign_up'}
		<SignUpForm bind:username>
			<button on:click={() => (view = 'sign_in')}>sign in</button>
		</SignUpForm>
	{/if}
{:else}
	<SignOutForm />
{/if}
