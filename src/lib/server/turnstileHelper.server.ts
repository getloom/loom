import type {ISessionApi} from '$lib/session/SessionApi';
import {CF_SECRETKEY} from '$env/static/private';

import {blue, gray} from 'kleur/colors';
import {Logger} from '@ryanatkn/belt/log.js';

const log = new Logger(gray('[') + blue('accountServices') + gray(']'));

//These two functions are responsible for server side validation of the Cloudfront Turnstile token
//Could be replaced by other CAPTCHA forms though.
export const validateToken = async (
	token: string,
	session: ISessionApi,
): Promise<string | null> => {
	if (CF_SECRETKEY) {
		if (token) {
			const ip = await session.getIp();
			if (!import.meta.env.DEV && !ip) {
				return `unable to extract ip from session`;
			}
			if (!(await cloudflareVerify(token, ip))) {
				return `unable to verify captcha token`;
			}
		} else {
			return `missing captcha token`;
		}
	}
	return null;
};

async function cloudflareVerify(token: string, ip: string | undefined) {
	const formData = new FormData();
	formData.append('secret', CF_SECRETKEY);
	formData.append('response', token);
	if (ip) {
		log.info('attaching ip for cloudflare', ip);
		formData.append('remoteip', ip);
	}

	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
	const result = await fetch(url, {
		body: formData,
		method: 'POST',
	});

	const outcome = await result.json();
	if (outcome.success) {
		return true;
	} else {
		return false;
	}
}
