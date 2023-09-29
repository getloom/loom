import type {SchemaObject} from 'ajv';
import {compile, type Options} from '@ryanatkn/json-schema-to-typescript';
import type {JsonSchema} from '@grogarden/gro/schema.js';

export const jsonSchemaToTypescript = (
	schema: JsonSchema | SchemaObject | null,
	name: string,
	options?: Partial<Options> | undefined,
): string | Promise<string> => {
	if (schema && typeof schema === 'object') {
		return compile(schema, name, {bannerComment: '', format: false, ...options});
	}
	return `export type ${name} = void;`;
};

export type JsonSchemaToTypeScriptOptions = Options;
