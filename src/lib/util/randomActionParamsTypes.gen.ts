import type {Gen} from '@grogarden/gro';
import {to_root_path} from '@grogarden/gro/paths.js';

import {actionDatas} from '$lib/vocab/action/actionData';

const toParamsName = (name: string): string => name + 'Params';

// Outputs a file with action types that can be imported from anywhere with no runtime cost.
export const gen: Gen = async ({origin_id}) => {
	return `
// generated by ${to_root_path(origin_id)}

import type {RandomVocab, RandomVocabContext} from '$lib/util/randomVocab';
import type {${actionDatas
		.map((e) => toParamsName(e.name))
		.join(',')}} from '$lib/vocab/action/actionTypes';

export interface RandomActionParams {
	${actionDatas.reduce(
		(str, actionData) =>
			str +
			`${
				actionData.name
			}: (random: RandomVocabContext, randomVocab?: RandomVocab) => Promise<${toParamsName(
				actionData.name,
			)}>;`.trim(),
		'',
	)}
}

// generated by ${to_root_path(origin_id)}
`.trim();
};
