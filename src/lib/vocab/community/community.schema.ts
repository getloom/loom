import {randomHue} from '$lib/ui/color';
import type {CommunitySettings} from '$lib/vocab/community/community';

export const CommunitySchema = {
	$id: '/schemas/Community.json',
	type: 'object',
	properties: {
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['standard', 'personal']},
		name: {type: 'string'},
		settings: {$ref: '/schemas/CommunitySettings.json'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['community_id', 'type', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
};

export const CommunitySettingsSchema = {
	$id: '/schemas/CommunitySettings.json',
	type: 'object',
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {type: 'number'},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
};

export const InitialCommunitySettingsSchema = {
	$id: '/schemas/InitialCommunitySettingsSchema.json',
	type: 'object',
	properties: {
		hue: {type: 'number'},
	},
	required: ['hue'],
	additionalProperties: false,
};

export const toDefaultCommunitySettings = (name: string): CommunitySettings => ({
	hue: randomHue(name),
	//this is a hack to allow for creation of the community before it's default role is created
	defaultRoleId: -1,
});
