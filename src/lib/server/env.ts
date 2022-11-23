import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

const dev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO fixme in multiple places to use `$app/environment`

// TODO how to configure this stuff in user projects? felt/gro config?

export const ENV_FILE_BASE = '.env';
export const ENV_FILE_PROD = '.env.production';
export const ENV_FILE_DEV = '.env.development';

const envs: Array<{file: string; defaultFile: string; load: boolean}> = [
	{file: ENV_FILE_BASE, defaultFile: `src/lib/infra/${ENV_FILE_BASE}.default`, load: true},
	{file: ENV_FILE_DEV, defaultFile: `src/lib/infra/${ENV_FILE_DEV}.default`, load: dev},
	{file: ENV_FILE_PROD, defaultFile: `src/lib/infra/${ENV_FILE_PROD}.default`, load: !dev},
];

interface Env {
	COOKIE_KEYS: string;
	PUBLIC_GIT_HASH: string;
	PUBLIC_DEPLOY_SERVER_HOST: string;
	PUBLIC_ADMIN_EMAIL_ADDRESS: string;
	DEPLOY_IP: string;
	DEPLOY_USER: string;
	CERTBOT_EMAIL_ADDRESS: string;
}

export const fromEnv = (key: keyof Env): string => {
	initEnv();
	const value = process.env[key];
	if (value === undefined) {
		throw Error(`Missing environment variable: ${key}`);
	}
	return value;
};

let initedEnv = false;

export const initEnv = (): void => {
	if (initedEnv) return;
	initedEnv = true;
	for (const env of envs) {
		if (!existsSync(env.file) && existsSync(env.defaultFile)) {
			copyFileSync(env.defaultFile, env.file);
		}
		if (env.load) dotenv.config({path: env.file});
	}
};

// Adds or updates an env var `value` for `key`.
export const updateEnv = (contents: string, key: string, value: string): string => {
	const matcher = new RegExp(`^${key}=(.*)$`, 'mu');
	const matched = contents.match(matcher);
	if (matched) {
		if (matched[1] === value) return contents;
		return contents.replace(matcher, `${key}=${value}`);
	}
	return contents + (contents.endsWith('\n') ? '' : '\n') + `${key}=${value}`;
};
