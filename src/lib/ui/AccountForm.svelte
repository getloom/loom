<script lang="ts">
	import {page} from '$app/stores';
	import { Turnstile } from 'svelte-turnstile';
	import {CODE_PARAM} from '$lib/vocab/invite/invite';
	import SignInForm from '$lib/ui/SignInForm.svelte';
	import SignUpForm from '$lib/ui/SignUpForm.svelte';
	import SignOutForm from '$lib/ui/SignOutForm.svelte';
	import HelpButton from '$lib/ui/HelpButton.svelte';

	export let guest: boolean;
	export let attrs: any = undefined;

	//TODO replace with env var and/or test key
	const PUBLIC_CF_SITEKEY = "1x00000000000000000000AA";
	//TODO tie this into blocking submit/buttons
	$: enableSubmit = false;

	let username = import.meta.env.DEV ? 'a@a.a' : ''; // share the username between the SignIn and SignUp forms for better UX
	
	const code = $page.url.searchParams.get(CODE_PARAM);

	let view: 'sign_in' | 'sign_up' = code ? 'sign_up' : 'sign_in'; // TODO likely add "forgot_password"

	function handleCallback(event: { detail: { token: any; }; }){
		if(event.detail.token){
			enableSubmit = true;
		}
	}	
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
	<Turnstile on:turnstile-callback={handleCallback} siteKey={PUBLIC_CF_SITEKEY} />
{:else}
	<SignOutForm {...attrs} />
{/if}
