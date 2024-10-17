<script lang="ts">
	import {page} from '$app/stores';
	import { Turnstile } from 'svelte-turnstile';
	import {CODE_PARAM} from '$lib/vocab/invite/invite';
	import SignInForm from '$lib/ui/SignInForm.svelte';
	import SignUpForm from '$lib/ui/SignUpForm.svelte';
	import SignOutForm from '$lib/ui/SignOutForm.svelte';
	import HelpButton from '$lib/ui/HelpButton.svelte';
	import { PUBLIC_CF_SITEKEY } from '$env/static/public'	

	export let guest: boolean;
	export let attrs: any = undefined;
		
	//TODO BLOCK update the docs on this you slacker
	//TODO BLOCK update the tests on this you slacker
	$: enableSubmit = PUBLIC_CF_SITEKEY ? false : true;
	$: CFToken = "";

	let username = import.meta.env.DEV ? 'a@a.a' : ''; // share the username between the SignIn and SignUp forms for better UX
	
	const code = $page.url.searchParams.get(CODE_PARAM);

	let view: 'sign_in' | 'sign_up' = code ? 'sign_up' : 'sign_in'; // TODO likely add "forgot_password"

	function handleCallback(event: { detail: { token: any; }; }){		
		if(event.detail.token){
			enableSubmit = true;
			CFToken = event.detail.token
		}
	}	
</script>

{#if guest}
	{#if view === 'sign_in'}		
		<SignInForm {...attrs} passedCaptcha={enableSubmit} token={CFToken} bind:username>
			<div class="box">
				<button on:click={() => (view = 'sign_up')}>sign up</button>
				<HelpButton />
			</div>
		</SignInForm>
	{:else if view === 'sign_up'}
		<SignUpForm {...attrs} passedCaptcha={enableSubmit} token={CFToken} bind:username>
			<div class="box">
				<button on:click={() => (view = 'sign_in')}>sign in</button>
				<HelpButton />
			</div>
		</SignUpForm>
	{/if}
	{#if PUBLIC_CF_SITEKEY}
		<div class="turnstile">
			<Turnstile on:turnstile-callback={handleCallback} siteKey={PUBLIC_CF_SITEKEY} />
		</div>
	{/if}
{:else}
	<SignOutForm {...attrs} />
{/if}

<style>
	.turnstile {
		align-self: center;
		text-align: center;
	}
</style>
