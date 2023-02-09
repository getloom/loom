import {toCounter} from '@feltjs/util/counter.js';

import {cyan} from '$lib/server/colors';

export interface LogSequence {
	(text: string, color?: typeof cyan): string;
}

export const toLogSequence = (): LogSequence => {
	const counter = toCounter();
	return (text, color = cyan) => `echo;echo;echo '${color(`${counter()}. ${text}`)}';\n`;
};

// TODO where does this belong?
export const DEPLOYED_SCRIPT_PATH = 'lib/infra/deployed'; // keep in sync with the actual file!
