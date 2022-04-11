import type {Gen} from '@feltcoop/gro';
import {toRootPath} from '@feltcoop/gro/dist/paths.js';
import {toVocabSchemaResolver} from '@feltcoop/gro/dist/utils/schema.js';

import {eventInfos} from '$lib/app/events';
import {
	jsonSchemaToTypescript,
	type JsonSchemaToTypeScriptOptions,
} from '$lib/util/jsonSchemaToTypescript';
import {schemas} from '$lib/app/schemas';

const toParamsName = (name: string): string => name + 'Params';
const toResponseName = (name: string): string => name + 'Response';
const toResponseResultName = (name: string): string => name + 'ResponseResult';

const opts: Partial<JsonSchemaToTypeScriptOptions> = {
	$refOptions: {
		resolve: {
			http: false, // disable web resolution
			vocab: toVocabSchemaResolver(schemas),
		},
	},
};

// Outputs a file with event types that can be imported from anywhere with no runtime cost.
export const gen: Gen = async ({originId}) => {
	return `
// generated by ${toRootPath(originId)}
  
import type {SvelteComponent} from 'svelte';
import type {Readable} from 'svelte/store';

import type {ApiResult} from '$lib/server/api';
import type {Community} from '$lib/vocab/community/community';
import type {Persona, AccountPersona} from '$lib/vocab/persona/persona';
import type {Membership} from '$lib/vocab/membership/membership';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ViewData} from '$lib/vocab/view/view';
import type {DispatchContext} from '$lib/app/dispatch';

/* eslint-disable @typescript-eslint/no-empty-interface, @typescript-eslint/array-type */

export interface EventParamsByName {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
${eventInfo.name}: ${toParamsName(eventInfo.name)};
`.trim(),
		'',
	)}
}
export interface EventResponseByName {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			(eventInfo.type === 'ClientEvent'
				? ''
				: `
${eventInfo.name}: ${toResponseName(eventInfo.name)};
`.trim()),
		'',
	)}
}

${await eventInfos.reduce(
	async (str, eventInfo) =>
		(await str) +
		`
${await jsonSchemaToTypescript(eventInfo.params, toParamsName(eventInfo.name), opts)}${
			'response' in eventInfo
				? await jsonSchemaToTypescript(eventInfo.response, toResponseName(eventInfo.name), opts)
				: ''
		}${
			// TODO hacky, the ApiResult type should be represented in the schema
			// but that requires generic type generation:
			// https://github.com/bcherny/json-schema-to-typescript/issues/59
			'response' in eventInfo
				? `	export type ${toResponseResultName(eventInfo.name)} = ApiResult<${toResponseName(
						eventInfo.name,
				  )}>;`
				: ''
		}
`,
	Promise.resolve(''),
)}

export interface Dispatch {
	${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`${eventInfo.name}: (params: ${toParamsName(eventInfo.name)}) => ${
				eventInfo.returns
			};`.trim(),
		'',
	)}
}

export interface Mutations {
  ${eventInfos.reduce(
		(str, eventInfo) =>
			str +
			`
      ${eventInfo.name}: (
        ctx: DispatchContext<${toParamsName(eventInfo.name)}, ${
				eventInfo.type === 'ClientEvent' ? 'void' : toResponseResultName(eventInfo.name)
			}>,
      ) => ${eventInfo.returns};
`.trim(),
		'',
	)}
}

// generated by ${toRootPath(originId)}
`.trim();
};
