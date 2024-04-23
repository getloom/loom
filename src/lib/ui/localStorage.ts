import {browser} from '$app/environment';
import type {Json} from '@ryanatkn/belt/json.js';
// import {Logger} from '@ryanatkn/belt/log.js';

// const log = new Logger('[storage]');

/**
 * Loads `key` and parses it as JSON.
 * If `validate` is provided and throws, it removes the `key` and returns `undefined`.
 * @param key - The unique storage key
 * @param validate - An optional validation function to check the stored value
 * @returns A valid value or undefined
 */
export const loadFromStorage = <T extends Json>(
	key: string,
	validate?: (value: any) => asserts value is T,
): T | undefined => {
	if (!browser) return;
	const stored = localStorage.getItem(key);
	if (!stored) {
		// log.debug('loaded nothing', key);
		return;
	}
	try {
		const parsed = JSON.parse(stored);
		validate?.(parsed);
		// log.debug('loaded', key, parsed);
		return parsed;
	} catch (err) {
		localStorage.removeItem(key);
		return;
	}
};

/**
 * Sets `value` at `key`.
 * If `value` is `undefined` the `key` is removed,
 * but a `value` of `null` is stored.
 * @param key - The unique storage key
 * @param value - The `JSON.stringify`-able value to put into storage
 */
export const setInStorage = (key: string, value: Json): void => {
	if (!browser) return;
	if (value === undefined) {
		// log.debug('removing', key);
		localStorage.removeItem(key);
	} else {
		// log.debug('setting', key, value);
		localStorage.setItem(key, JSON.stringify(value));
	}
};
