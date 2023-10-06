import {actionDatas} from '$lib/vocab/action/actionData.js';
import {
	modelNames as modelNamesMetadata,
	schemaNames as schemaNamesMetadata,
	vocabNames as vocabNamesMetadata,
	viewNames as viewNamesMetadata,
	clientActionNames as clientActionNamesMetadata,
	serviceActionNames as serviceActionNamesMetadata,
} from '$lib/vocab/metadata.js';
import {modelSchemas} from '$lib/vocab/schemas.js';
import {viewTemplates} from '$lib/vocab/view/view.js';
import type {ClientActionData, ServiceActionData} from '$lib/vocab/action/action.js';
import type {VocabName} from '$lib/vocab/vocab.js';

// TODO this is somewhat messy, refactor with `$lib/vocab/metadata.ts` and the above deps
// see also `DocsVocabContent` how it receives modelSchemas and modelSchemaNames separately

export const sortedModelSchemas = modelSchemas; // TODO `sorted` is unnecessary and the export is redundant
export const sortedViewTemplates = viewTemplates
	.slice()
	.sort((a, b) => a.name.localeCompare(b.name));
export const clientActions = actionDatas.filter(
	(a) => a.type === 'ClientAction',
) as ClientActionData[];
export const serviceActions = actionDatas.filter(
	(a) => a.type === 'ServiceAction',
) as ServiceActionData[];

export const schemaNames = new Set(schemaNamesMetadata);

// TODO maybe these should be suffixed with `Set`? or make them maps?
export const vocabNames = new Set(vocabNamesMetadata);
export const viewNames = new Set(viewNamesMetadata);
export const modelNames = new Set(modelNamesMetadata);
export const clientActionNames = new Set(clientActionNamesMetadata);
export const serviceActionNames = new Set(serviceActionNamesMetadata);

export type VocabCategory = 'views' | 'models' | 'service_actions' | 'client_actions';

// TODO either separate `names` from schemas, or change these sets to maps
export const namesByCategory: Map<VocabCategory, Set<VocabName>> = new Map([
	['views', viewNames],
	['models', modelNames],
	['client_actions', clientActionNames],
	['service_actions', serviceActionNames],
]);
