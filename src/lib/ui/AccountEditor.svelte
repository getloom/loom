<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {Account} from '$lib/vocab/account/account';
	import UpdateAccountPasswordForm from '$lib/ui/UpdateAccountPasswordForm.svelte';

	export let account: Readable<Account>;

	const {dispatch} = getApp();

	const updateAccountSettings = async (updated: any) =>
		dispatch.UpdateAccountSettings({
			settings: updated,
		});
</script>

<div class="entity-editor column">
	<div class="markup padded-xl">
		<h1>Account Settings</h1>
		<section class="row">
			<span class="spaced">for {$account.name}</span>
		</section>
		<section style:--icon_size="var(--icon_size_sm)">
			<p>created {format($account.created, 'PPPPp')}</p>
			{#if $account.updated !== null}
				<p>updated {format($account.updated, 'PPPPp')}</p>
			{/if}
		</section>
	</div>
	<UpdateAccountPasswordForm />
	<!-- TODO add entity property contextmenu actions to this -->
	<form>
		<ul>
			<li>
				<PropertyEditor
					value={$account.settings}
					field="settings"
					update={updateAccountSettings}
					parse={parseJson}
					serialize={serializeJson}
				/>
			</li>
		</ul>
	</form>
</div>

<style>
	.entity-editor {
		padding: var(--spacing_xl);
	}
	h1 {
		text-align: center;
	}
	form li {
		flex-direction: column;
		padding: var(--spacing_xl) 0;
	}
</style>
