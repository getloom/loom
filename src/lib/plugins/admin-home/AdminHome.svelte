<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import RolesList from '$lib/ui/RolesList.svelte';
	import {getSpaceContext} from '$lib/vocab/view/view';
	import {page} from '$app/stores';

	const origin = $page.url.origin;

	const {hub} = getSpaceContext();
	const {actions} = getApp();

	$: instanceSettings = $hub.settings.instance;

	let pending = false;

	let code = '';

	const deploy = async () => {
		if (pending) return;
		pending = true;
		const result = await actions.CreateInvite(null);
		if (result.ok) {
			code = origin + '/?code=' + result.value.invite.code;
		} else {
			code = 'error fetching code';
		}

		pending = false;
	};
</script>

<div class="padded_1">
	<section>
		<div class="prose">
			<h1>admin</h1>
		</div>
	</section>
	<section>
		<div class="prose">
			<h2>roles</h2>
		</div>
		<RolesList />
	</section>
	{#if instanceSettings?.enableInviteOnlySignups}
		<section>
			<div class="prose">
				<h2>create invite link</h2>
				<h3>copy and paste the generated link below and send it to your invitee</h3>
			</div>
			<button type="button" on:click={deploy} disabled={pending}>generate invite code</button>
			<span>{code}</span>
		</section>
	{/if}
</div>

<style>
	section {
		margin-bottom: var(--spacing_7);
	}
</style>
