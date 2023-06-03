import {randomBytes, scrypt, timingSafeEqual} from 'crypto';
import {promisify} from 'util';

import {passwordWorker} from '$lib/server/passwordWorker';

const SALT_SIZE = 16;
const HASH_SIZE = 32;

const toScrypt = promisify(scrypt);

/**
 * Returns the string `salt:hash` to be stored in the database.
 * The returned key can be compared to a password attempt with `verifyPassword`.
 * Calls `hashPassword` internally in a worker.
 * @param passwordText - plain text password
 * @returns salted and hashed password
 */
export const toPasswordKey = async (passwordText: string): Promise<string> => {
	return passwordWorker(passwordText)!;
};

/**
 * Same as `toPasswordKey` but does the work on the current thread.
 * @param passwordText - plain text password
 * @returns salted and hashed password
 */
export const hashPassword = async (passwordText: string): Promise<string> => {
	const salt = randomBytes(SALT_SIZE).toString('hex');
	const hash = (await toHash(passwordText, salt)).toString('hex');
	return `${salt}:${hash}`;
};

/**
 * Checks if a `password` matches the generated hash and salt in `key` from `toPasswordKey`.
 * @param passwordText - plain text password
 * @param passwordKey - salted and hashed password result of `toPasswordKey`
 * @returns boolean indicating if they match
 */
export const verifyPassword = async (
	passwordText: string,
	passwordKey: string,
): Promise<boolean> => {
	const [salt, hash] = passwordKey.split(':');
	return timingSafeEqual(Buffer.from(hash, 'hex'), await toHash(passwordText, salt));
};

const toHash = (passwordText: string, salt: string): Promise<Buffer> =>
	toScrypt(passwordText, salt, HASH_SIZE) as any;
