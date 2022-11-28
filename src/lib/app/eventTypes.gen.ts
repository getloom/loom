import type {Gen} from '@feltcoop/gro';
import {toRootPath} from '@feltcoop/gro/dist/paths.js';
import {toVocabSchemaResolver} from '@feltcoop/gro/dist/utils/schema.js';

import {eventInfos} from '$lib/app/events';
import {
	jsonSchemaToTypescript,
	type JsonSchemaToTypeScriptOptions,
} from '$lib/util/jsonSchemaToTypescript';
import {schemas} from '$lib/app/schemas';
import {services} from '$lib/server/services';
import type {Service} from '$lib/server/service';

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
import type {Readable, Mutable} from '@feltcoop/svelte-gettable-stores';
import type {AsyncStatus} from '@feltcoop/util/async.js';

import type {ApiResult} from '$lib/server/api';
import type {NonAuthenticatedService, NonAuthorizedService, AuthorizedService} from '$lib/server/service';
import type {Community} from '$lib/vocab/community/community';
import type {PublicPersona, ClientPersona} from '$lib/vocab/persona/persona';
import type {Assignment} from '$lib/vocab/assignment/assignment';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData, DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Tie} from '$lib/vocab/tie/tie';
import type {Role} from '$lib/vocab/role/role';
import type {Policy} from '$lib/vocab/policy/policy';
import type {DispatchContext} from '$lib/app/dispatch';
import type {ClientSession, ClientAccountSession} from '$lib/vocab/account/account';

/* eslint-disable @typescript-eslint/array-type */

export type ServiceEventName = ${eventInfos.reduce(
		(str, eventInfo) => str + (eventInfo.type === 'ServiceEvent' ? `| '${eventInfo.name}'` : ''),
		'',
	)};

export type ClientEventName = ${eventInfos.reduce(
		(str, eventInfo) => str + (eventInfo.type === 'ClientEvent' ? `| '${eventInfo.name}'` : ''),
		'',
	)};

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

export interface ServiceByName {
	${Array.from(services.values()).reduce((str, service) => {
		const {name} = service.event;
		return (
			str +
			`${name}: ${toServiceAuthPrefix(service)}Service<${toParamsName(
				name,
			)}, ${toResponseResultName(name)}>;`.trim()
		);
	}, '')}
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
			`${eventInfo.name}: (${
				eventInfo.params?.type === 'null' ? '' : `params: ${toParamsName(eventInfo.name)}`
			}) => ${eventInfo.returns};`.trim(),
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

const toServiceAuthPrefix = (service: Service): string =>
	service.event.authenticate === false
		? 'NonAuthenticated'
		: service.event.authorize === false
		? 'NonAuthorized'
		: 'Authorized';
