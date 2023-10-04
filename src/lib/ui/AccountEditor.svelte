<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import {getApp} from '$lib/ui/app';
	import {parseJson, serializeJson} from '$lib/util/json';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';
	import type {ClientAccount} from '$lib/vocab/account/account';
	import UpdateAccountPasswordForm from '$lib/ui/UpdateAccountPasswordForm.svelte';

	export let account: Readable<ClientAccount | null>;

	const {actions} = getApp();

	const updateAccountSettings = async (updated: any) =>
		actions.UpdateAccountSettings({
			settings: updated,
		});
</script>

{#if $account}
	<div class="account-editor width_md">
		<div class="prose box padded_1">
			<h2>Account</h2>
			<section>
				<div style:font-size="var(--size_1)">{$account.name}</div>
				<div>created {format($account.created, 'PPPPp')}</div>
				{#if $account.updated !== null}
					<div>updated {format($account.updated, 'PPPPp')}</div>
				{/if}
			</section>
		</div>
		<UpdateAccountPasswordForm />
		<!-- TODO add account property contextmenu actions to this -->
		<form>
			<fieldset>
				<PropertyEditor
					value={$account.settings}
					field="settings"
					update={updateAccountSettings}
					parse={parseJson}
					serialize={serializeJson}
				/>
			</fieldset>
		</form>
	</div>
{/if}

<style>
	.account-editor {
		padding: var(--spacing_1);
	}
</style>
