import type {Account, AccountSettings} from '$lib/vocab/account/account.js';
import type { ISessionApi } from "$lib/session/SessionApi";
import { CF_SECRETKEY } from '$env/static/private'

export type AccountColumn = keyof Account;
export const ACCOUNT_COLUMNS = {
	all: ['account_id', 'name', 'password', 'settings', 'created', 'updated'],
	client: ['account_id', 'name', 'settings', 'created', 'updated'],
	account_id: ['account_id'],
	password: ['password'],
	name: ['name'],
	account_id_password: ['account_id', 'password'],
} satisfies Record<string, AccountColumn[]>;

export const toDefaultAccountSettings = (): AccountSettings => ({
	darkmode: false,
});

//These two functions are responsible for server side validation of the Cloudfront Turnstile token
//Could be replaced by other CAPTCHA forms though.
export const validateToken = async (token: string, session: ISessionApi): Promise<string | null> => {
	if (CF_SECRETKEY){
		if (token) {		
			const ip = await session.getIp();
			if (!import.meta.env.DEV && !ip){
				return `unable to extract ip from session`;
			}
			if (!await cloudflareVerify(token, ip)){
				return `unable to verify captcha token`;
			}
		} else {
			console.log(token);
			return `missing captcha token`;
		}
	}
	return null;
};

async function cloudflareVerify(token: string, ip: string | undefined){
	const formData = new FormData();
	formData.append('secret',CF_SECRETKEY);
	formData.append('response', token);
	if (ip){
		formData.append('remoteip', ip);
	}
	
  
	const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
	  const result = await fetch(url, {
		  body: formData,
		  method: 'POST',
	  });
  
	  const outcome = await result.json(); 
	  console.log(outcome);
	  if (outcome.success) {    
		  return true;
	  } else {    
	  return false;
	}
  
  }
