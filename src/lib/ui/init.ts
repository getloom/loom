import {Logger} from '@feltjs/util/log.js';
/* eslint-disable no-console */

export const initBrowser = (): void => {
	// TODO hacky -- need to change the upstream Logger to be more usable on the client
	Logger.prototype.warn = console.warn.bind(console);
	Logger.prototype.error = console.error.bind(console);
	Logger.error.prefixes.length = 0;
	Logger.error.suffixes.length = 0;
	Logger.warn.prefixes.length = 0;
	Logger.warn.suffixes.length = 0;
	Logger.info.prefixes.length = 0;
	Logger.info.suffixes.length = 0;
	Logger.debug.prefixes.length = 0;
	Logger.debug.suffixes.length = 0;
};
