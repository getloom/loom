import type {VocabSchema} from '@feltjs/gro';

import {permissionNames} from '$lib/vocab/permission/permissionHelpers';

export const PermissionNameSchema = {
	$id: '/schemas/PermissionName',
	type: 'string',
	enum: permissionNames,
} satisfies VocabSchema;
