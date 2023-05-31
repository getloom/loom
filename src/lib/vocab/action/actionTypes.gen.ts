import type {Gen, GenContext} from '@feltjs/gro';
import {toRootPath} from '@feltjs/gro/dist/paths.js';
import {toVocabSchemaResolver, inferSchemaTypes} from '@feltjs/gro/dist/utils/schema.js';
import {loadModules} from '@feltjs/gro/dist/fs/modules.js';
import {findGenModules, loadGenModule} from '@feltjs/gro/dist/gen/genModule.js';
import {toGenContextImports} from '@feltjs/gro/dist/gen/runGen.js';
import {resolveRawInputPaths} from '@feltjs/gro/dist/fs/inputPath.js';
import type {Filesystem} from '@feltjs/gro/dist/fs/filesystem.js';
import {normalizeTypeImports} from '@feltjs/gro/dist/gen/helpers/typeImports.js';
import {traverse} from '@feltjs/util/object.js';

import {actionDatas} from '$lib/vocab/action/actionData';
import {
	jsonSchemaToTypescript,
	type JsonSchemaToTypeScriptOptions,
} from '$lib/util/jsonSchemaToTypescript';
import {schemas} from '$lib/vocab/schemas';
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

// TODO upstream to Gro?
const loadImports = async (fs: Filesystem): Promise<Record<string, string>> => {
	const findModulesResult = await findGenModules(fs, resolveRawInputPaths([]));
	if (!findModulesResult.ok) throw Error();
	const loadModulesResult = await loadModules(
		findModulesResult.sourceIdsByInputPath,
		true,
		loadGenModule,
	);
	if (!loadModulesResult.ok) throw Error();
	const imports = toGenContextImports(loadModulesResult.modules);
	return imports;
};

// Outputs a file with action types that can be imported from anywhere with no runtime cost.
export const gen: Gen = async ({originId, fs, log}) => {
	// TODO see about cleaning this up with a helper, we're basically doing a manual `gen` task run
	const imports = await loadImports(fs);
	const genCtx: GenContext = {imports, originId, fs, log};
	inferSchemaTypes(actionDatas as any, genCtx);
	// TODO refactor, cache somewhere maybe?
	const $refs = new Set<string>();
	const tsImports: string[] = [];
	traverse(actionDatas, (key, value, obj) => {
		if (key === 'tsImport') tsImports.push(value);
		if (key === '$ref' && !('tsImport' in obj)) $refs.add(value);
	});
	const rawImports = Object.entries(imports)
		.filter((v) => $refs.has('/schemas/' + v[0]))
		.map((v) => v[1])
		.concat(tsImports);
	const typeImports = await normalizeTypeImports(fs, rawImports, originId);
	return `
// generated by ${toRootPath(originId)}

${typeImports.join('\n')}
import type {ApiResult} from '$lib/server/api';
import type {Query} from '$lib/util/query';
import type {NonAuthenticatedService, NonAuthorizedService, AuthorizedService} from '$lib/server/service';
import type {MutationContext} from '$lib/ui/mutation';
import type {HubTemplate} from '$lib/app/templates';

/* eslint-disable @typescript-eslint/array-type */

export type ServiceActionName = ${actionDatas.reduce(
		(str, actionData) =>
			str + (actionData.type === 'ServiceAction' ? `| '${actionData.name}'` : ''),
		'',
	)};

export type ClientActionName = ${actionDatas.reduce(
		(str, actionData) => str + (actionData.type === 'ClientAction' ? `| '${actionData.name}'` : ''),
		'',
	)};

export interface ActionParamsByName {
	${actionDatas.reduce(
		(str, actionData) =>
			str +
			`
${actionData.name}: ${toParamsName(actionData.name)};
`.trim(),
		'',
	)}
}
export interface ActionResponseByName {
	${actionDatas.reduce(
		(str, actionData) =>
			str +
			(actionData.type === 'ClientAction'
				? ''
				: `
${actionData.name}: ${toResponseName(actionData.name)};
`.trim()),
		'',
	)}
}

export interface ServiceByName {
	${Array.from(services.values()).reduce((str, service) => {
		const {name} = service.action;
		return (
			str +
			`${name}: ${toServiceAuthPrefix(service)}Service<${toParamsName(
				name,
			)}, ${toResponseResultName(name)}>;`.trim()
		);
	}, '')}
}

${await actionDatas.reduce(
	async (str, actionData) =>
		(await str) +
		`
${await jsonSchemaToTypescript(actionData.params, toParamsName(actionData.name), opts)}${
			'response' in actionData
				? await jsonSchemaToTypescript(actionData.response, toResponseName(actionData.name), opts)
				: ''
		}${
			// TODO hacky, the ApiResult type should be represented in the schema
			// but that requires generic type generation:
			// https://github.com/bcherny/json-schema-to-typescript/issues/59
			'response' in actionData
				? `	export type ${toResponseResultName(actionData.name)} = ApiResult<${toResponseName(
						actionData.name,
				  )}>;`
				: ''
		}
`,
	Promise.resolve(''),
)}

export interface Actions {
	${actionDatas.reduce(
		(str, actionData) =>
			str +
			`${actionData.name}: (${
				actionData.params?.type === 'null' ? '' : `params: ${toParamsName(actionData.name)}`
			}) => ${actionData.returns};`.trim(),
		'',
	)}
}

export interface Mutations {
  ${actionDatas.reduce(
		(str, actionData) =>
			str +
			`
      ${actionData.name}: (
        ctx: MutationContext<${toParamsName(actionData.name)}, ${
				actionData.type === 'ClientAction' ? 'void' : toResponseResultName(actionData.name)
			}>,
      ) => ${actionData.returns};
`.trim(),
		'',
	)}
}

// generated by ${toRootPath(originId)}
`.trim();
};

const toServiceAuthPrefix = (service: Service): string =>
	service.action.authenticate === false
		? 'NonAuthenticated'
		: service.action.authorize === false
		? 'NonAuthorized'
		: 'Authorized';
