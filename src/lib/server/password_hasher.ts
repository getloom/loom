import {create_password_hasher_worker} from '$lib/server/password_hasher.worker.js';

export interface PasswordHasher {
	/**
	 * Calls `toPasswordKey in the worker pool.
	 */
	encrypt: (passwordText: string) => Promise<string>;
	/**
	 * Calls `verifyPassword in the worker pool.
	 */
	verify: (passwordText: string, passwordKey: string) => Promise<boolean>;
	/**
	 * Exits the worker pool.
	 */
	close: () => Promise<void>;
}

/**
 * Returns a password helper object backed by a worker pool.
 * Use `close` to free the resources.
 */
export const create_password_hasher = (): PasswordHasher => create_password_hasher_worker(); // this is a circular dependency that breaks without the function wrapper
