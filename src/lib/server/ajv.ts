import Ajv, {type Options, type ErrorObject, type ValidateFunction, type SchemaObject} from 'ajv';
import type {Json_Schema} from '@grogarden/gro/schema.js';
import AjvKeywordInstanceof from 'ajv-keywords/dist/keywords/instanceof.js';

import {schemas} from '$lib/vocab/schemas.js';

// see also $lib/util/schema.ts

let ajvInstance: Ajv | null = null;

// TODO only one instance is created, which may be surprising in rare cases
export const ajv = (opts?: Options): Ajv => {
	if (ajvInstance) return ajvInstance;
	ajvInstance = new Ajv(opts);
	ajvInstance.addKeyword('tsType').addKeyword('tsImport');
	AjvKeywordInstanceof(ajvInstance);
	ajvInstance.addSchema(schemas);
	return ajvInstance;
};

export interface CreateValidate<T = unknown> {
	(): ValidateFunction<T>;
}

const validators: Map<SchemaObject | Json_Schema, ValidateFunction> = new Map();

// Memoizes the returned schema validation function in the module-level lookup `validators`.
// Does not support multiple instantiations with different options.
export const validateSchema = <T>(schema: SchemaObject | Json_Schema): ValidateFunction<T> =>
	toValidateSchema<T>(schema)();

// Creates a lazily-compiled schema validation function to avoid wasteful compilation.
// It's also faster than ajv's internal compiled schema cache
// because we can assume a consistent environment.
export const toValidateSchema = <T>(schema: SchemaObject | Json_Schema): CreateValidate<T> => {
	let validate = validators.get(schema) as ValidateFunction<T> | undefined;
	return () => {
		if (validate) return validate;
		validate = ajv().compile(schema as SchemaObject);
		validators.set(schema, validate);
		return validate;
	};
};

// TODO probably misses a bunch of cases
export const toValidationErrorMessage = (e: ErrorObject): string =>
	e.keyword === 'additionalProperties'
		? `${e.message}: '${e.params.additionalProperty}'`
		: e.instancePath
			? `'${e.instancePath.substring(1)}' ${e.message}`
			: e.message!;
