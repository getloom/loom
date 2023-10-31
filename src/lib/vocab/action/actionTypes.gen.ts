import type {Gen, Gen_Context} from '@grogarden/gro/gen.js';
import {to_root_path} from '@grogarden/gro/paths.js';
import {to_json_schema_resolver, infer_schema_types} from '@grogarden/gro/schema.js';
import {load_modules} from '@grogarden/gro/modules.js';
import {find_gen_modules, load_gen_module} from '@grogarden/gro/gen_module.js';
import {to_gen_context_imports} from '@grogarden/gro/run_gen.js';
import {resolve_input_paths} from '@grogarden/gro/input_path.js';
import {normalize_type_imports} from '@grogarden/gro/type_imports.js';
import {traverse} from '@grogarden/util/object.js';

import {actionDatas} from '$lib/vocab/action/actionData.js';
import {
	jsonSchemaToTypescript,
	type Json_SchemaToTypeScriptOptions,
} from '$lib/util/jsonSchemaToTypescript.server.js';
import {schemas} from '$lib/vocab/schemas.js';
import {services} from '$lib/server/services.js';
import type {Service} from '$lib/server/service.js';

const toParamsName = (name: string): string => name + 'Params';
const toResponseName = (name: string): string => name + 'Response';
const toResponseResultName = (name: string): string => name + 'ResponseResult';

const opts: Partial<Json_SchemaToTypeScriptOptions> = {
	$refOptions: {
		resolve: {
			http: false, // disable web resolution
			vocab: to_json_schema_resolver(schemas),
		},
	},
};

// TODO upstream to Gro?
const load_imports = async (): Promise<Record<string, string>> => {
	const find_modules_result = await find_gen_modules(resolve_input_paths());
	if (!find_modules_result.ok) throw Error();
	const load_modules_result = await load_modules(
		find_modules_result.source_ids_by_input_path,
		load_gen_module,
	);
	if (!load_modules_result.ok) throw Error();
	const imports = to_gen_context_imports(load_modules_result.modules);
	return imports;
};

// Outputs a file with action types that can be imported from anywhere with no runtime cost.
export const gen: Gen = async ({origin_id, log}) => {
	// TODO see about cleaning this up with a helper, we're basically doing a manual `gen` task run
	const imports = await load_imports();
	const genCtx: Gen_Context = {imports, origin_id, log};
	// TODO refactor, cache somewhere maybe?
	const $refs = new Set<string>();
	const tsImports: string[] = [];
	const action_data_items = structuredClone(actionDatas);
	// TODO maybe add a Gro helper for these
	infer_schema_types(action_data_items as any, genCtx);
	traverse(action_data_items, (key, value, obj) => {
		if (key === 'tsImport') tsImports.push(value);
		if (key === '$ref' && !('tsImport' in obj)) $refs.add(value);
	});
	const rawImports = Object.entries(imports)
		.filter((v) => $refs.has('/schemas/' + v[0]))
		.map((v) => v[1])
		.concat(tsImports);
	const typeImports = await normalize_type_imports(rawImports, origin_id);
	return `
// generated by ${to_root_path(origin_id)}

${typeImports.join('\n')}
import type {ApiResult} from '$lib/server/api.js';
import type {NonAuthenticatedService, NonAuthorizedService, AuthorizedService} from '$lib/server/service.js';
import type {MutationContext} from '$lib/util/mutation.js';
import type {HubTemplate} from '$lib/ui/templates.js';
import type {Flavored} from '@grogarden/util/types.js'; // TODO something is buggy here, shouldn't be needed

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

${await structuredClone(action_data_items).reduce(
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

// generated by ${to_root_path(origin_id)}
`.trim();
};

const toServiceAuthPrefix = (service: Service): string =>
	service.action.authenticate === false
		? 'NonAuthenticated'
		: service.action.authorize === false
		? 'NonAuthorized'
		: 'Authorized';
