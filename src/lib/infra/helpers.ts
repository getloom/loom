import {create_counter} from '@grogarden/util/counter.js';

import {cyan} from '$lib/server/colors.js';

export interface LogSequence {
	(text: string, color?: typeof cyan): string;
}

export const create_log_sequence = (): LogSequence => {
	const counter = create_counter();
	return (text, color = cyan) => `echo;echo;echo '${color(`${counter()}. ${text}`)}';\n`;
};
