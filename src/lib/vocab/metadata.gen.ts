import type {Gen} from '@feltjs/gro';
import {toRootPath} from '@feltjs/gro/dist/paths.js';

import {toSchemaName} from '$lib/util/schema';
import {schemas, modelSchemas} from '$lib/vocab/schemas';
import {viewTemplates} from '$lib/vocab/view/view';
import {actionDatas} from '$lib/vocab/action/actionData';

// TODO this is somewhat messy, refactor with `$lib/vocab/data.ts` and the above deps

/**
 * Outputs static vocab data.
 * The motivation for this module was that `VocabName` couldn't be used as a schema
 * because it was circularly defined, as the names were derived from the schemas
 * which the `VocabName` schema then imported.
 * The schema can instead depend on this generated static data to avoid the problem.
 * @returns
 */
export const gen: Gen = async ({originId}) => {
	const schemaNames = schemas.map((s) => toSchemaName(s.$id)).sort((a, b) => a.localeCompare(b));
	const viewNames = viewTemplates.map((v) => v.name).sort((a, b) => a.localeCompare(b));
	const modelNames = modelSchemas.map((s) => toSchemaName(s.$id));
	const actionNames = actionDatas.map((s) => s.name);
	const clientActionNames = actionDatas.filter((a) => a.type === 'ClientAction').map((a) => a.name);
	const serviceActionNames = actionDatas
		.filter((a) => a.type === 'ServiceAction')
		.map((a) => a.name);
	const vocabNames = viewNames
		.concat(modelNames, clientActionNames, serviceActionNames)
		.sort((a, b) => a.localeCompare(b));

	const render = (s: string[]) => s.map((n) => `'${n}'`).join(', ');

	return `
// generated by ${toRootPath(originId)}

import type {SchemaName, VocabName} from '$lib/vocab/vocab';

export const schemaNames: SchemaName[] = [${render(schemaNames)}];

export const vocabNames: VocabName[] = [${render(vocabNames)}];

export const viewNames: VocabName[] = [${render(viewNames)}];

export const modelNames: VocabName[] = [${render(modelNames)}];

export const actionNames: VocabName[] = [${render(actionNames)}];

export const clientActionNames: VocabName[] = [${render(clientActionNames)}];

export const serviceActionNames: VocabName[] = [${render(serviceActionNames)}];
	`;
};