// TODO copypasted from polka@next, can't use the module because of a routing bug
// where params are added for routes that don't declare them when there's overlap
// https://github.com/getloom/loom/pull/859

/* eslint-disable @typescript-eslint/ban-types */

declare module 'trouter' {
	// Thank you: @fwilkerson, @stahlstift
	// ---

	/** @type {import('http').METHODS} */
	type Methods = 'ACL' | 'BIND' | 'CHECKOUT' | 'CONNECT' | 'COPY' | 'DELETE' | 'GET' | 'HEAD' | 'LINK' | 'LOCK' |'M-SEARCH' | 'MERGE' | 'MKACTIVITY' |'MKCALENDAR' | 'MKCOL' | 'MOVE' |'NOTIFY' | 'OPTIONS' | 'PATCH' | 'POST' | 'PRI' | 'PROPFIND' |  'PROPPATCH' |  'PURGE' | 'PUT' | 'REBIND' | 'REPORT' | 'SEARCH' | 'SOURCE' | 'SUBSCRIBE' | 'TRACE' | 'UNBIND' | 'UNLINK' | 'UNLOCK' | 'UNSUBSCRIBE'; // prettier-ignore

	type Pattern = RegExp | string;

	export default class Trouter<T = Function> {
		find(
			method: Methods,
			url: string,
		): {
			params: Record<string, string>;
			handlers: T[];
		};
		add(method: Methods, pattern: Pattern, ...handlers: T[]): this;
		use(pattern: Pattern, ...handlers: T[]): this;
		all(pattern: Pattern, ...handlers: T[]): this;
		get(pattern: Pattern, ...handlers: T[]): this;
		head(pattern: Pattern, ...handlers: T[]): this;
		patch(pattern: Pattern, ...handlers: T[]): this;
		options(pattern: Pattern, ...handlers: T[]): this;
		connect(pattern: Pattern, ...handlers: T[]): this;
		delete(pattern: Pattern, ...handlers: T[]): this;
		trace(pattern: Pattern, ...handlers: T[]): this;
		post(pattern: Pattern, ...handlers: T[]): this;
		put(pattern: Pattern, ...handlers: T[]): this;
	}
}
