import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

// TODO how to configure this stuff in user projects? felt/gro config?

export const ENV_PROD = '.env.production';
export const ENV_DEV = '.env.development';

const dev = import.meta?.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO support in Gro and remove second half

const envs: Array<{file: string; defaultFile: string; load: boolean}> = [
	{file: '.env', defaultFile: 'src/infra/.env.default', load: true},
	{file: ENV_DEV, defaultFile: `src/infra/${ENV_DEV}.default`, load: dev},
	{file: ENV_PROD, defaultFile: `src/infra/${ENV_PROD}.default`, load: !dev},
];

interface Env {
	COOKIE_KEYS: string;
	PUBLIC_GIT_HASH: string;
	PUBLIC_DEPLOY_SERVER_HOST: string;
	PUBLIC_HELP_EMAIL_ADDRESS: string;
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
		if (env.load) {
			if (!existsSync(env.file)) {
				copyFileSync(env.defaultFile, env.file);
			}
			dotenv.config({path: env.file});
		}
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
