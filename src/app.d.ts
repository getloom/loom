// See https://kit.svelte.dev/docs/types#app

import type {AccountId} from '$lib/vocab/account/account';

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			account_id?: AccountId;
		}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
