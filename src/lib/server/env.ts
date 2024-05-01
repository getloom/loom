import {randomInt} from 'crypto';

import {env as env_dynamic_public} from '$env/dynamic/public';
import type * as env_static_private from '$env/static/private';
import type * as env_static_public from '$env/static/public';
import {readFile, writeFile} from 'node:fs/promises';
import {exists} from '@ryanatkn/gro/fs.js';
import {load_env} from '@ryanatkn/gro/env.js';

export const ENV_FILE_BASE = '.env';
export const ENV_FILE_PROD = '.env.production';
export const ENV_FILE_DEV = '.env.development';

interface Env_File {
	path: string;
	example_path: string;
	load: boolean;
}

const env_files: Env_File[] = [
	{path: ENV_FILE_BASE, example_path: `src/lib/infra/${ENV_FILE_BASE}.example`, load: true},
	{
		path: ENV_FILE_DEV,
		example_path: `src/lib/infra/${ENV_FILE_DEV}.example`,
		load: import.meta.env.DEV,
	},
	{
		path: ENV_FILE_PROD,
		example_path: `src/lib/infra/${ENV_FILE_PROD}.example`,
		load: import.meta.env.PROD,
	},
];

/**
 * Returns a boolean indicating if any files were initialized.
 */
export const init_env = async (): Promise<boolean> => {
	let inited = false;
	await Promise.all(
		env_files.map(async (env_file) => {
			if (!(await exists(env_file.path))) {
				await init_env_file(env_file);
				inited = true;
			}
		}),
	);
	return inited;
};

const init_env_file = async (env_file: Env_File): Promise<void> => {
	const example_contents = await readFile(env_file.example_path, 'utf8');
	const contents = example_contents.replaceAll('🎲', () => random_char());
	await writeFile(env_file.path, contents, 'utf8');
};

// TODO move this to another module?
const random_char = (chars = alphanumerics): string => chars[randomInt(chars.length)];
const alphanumerics = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');

/**
 * Updates `PUBLIC_GIT_HASH`, mutating the runtime dynamic env with the new value.
 * Note that it can only modify the dynamic env value,
 * so task and infra code must use `env.PUBLIC_GIT_HASH` from `$env/dynamic/public`,
 * while server and client code should use `PUBLIC_GIT_HASH` from `$env/static/public`.
 * @returns `true` if the hash changed or `false` if it already matched
 */
export const update_env_git_hash = async (file: string, hash: string): Promise<boolean> => {
	const contents = await readFile(file, 'utf8');
	const updated = update_env_value(contents, 'PUBLIC_GIT_HASH', hash);

	// changed?
	if (updated === contents) return false;

	await writeFile(file, updated, 'utf8');

	env_dynamic_public.PUBLIC_GIT_HASH = hash;

	return true;
};

/**
 * Adds or updates an env var `value` for `key` in serialized env `contents`.
 * @returns the updated `contents`
 */
const update_env_value = (contents: string, key: string, value: string): string => {
	const matcher = new RegExp(`^${key}=(.*)$`, 'mu');
	const matched = contents.match(matcher);
	if (matched) {
		if (matched[1] === value) return contents;
		return contents.replace(matcher, `${key}=${value}`);
	}
	return contents + (contents.endsWith('\n') ? '' : '\n') + `${key}=${value}\n`;
};

/**
 * Loads `$env/static/private` and `$env/static/public` for either dev or prod.
 * Useful for tasks that need to use production environment variables in a dev runtime context.
 */
export const load_envs = async (
	dev: boolean,
): Promise<typeof env_static_public & typeof env_static_private> => {
	const public_production_env = (await load_env(
		dev,
		'public',
		'PUBLIC_', // TODO hardcoded, probably refactor `load_env` to be less awkward
		'',
		undefined,
		undefined,
		{},
	)) as typeof env_static_public;
	const private_production_env = (await load_env(
		dev,
		'private',
		'PUBLIC_',
		'',
		undefined,
		undefined,
		{},
	)) as typeof env_static_private;
	return {...public_production_env, ...private_production_env};
};
