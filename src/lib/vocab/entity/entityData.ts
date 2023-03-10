import type {Entity} from '$lib/vocab/entity/entity';

export type EntityData =
	| DirectoryEntityData
	| NoteEntityData
	| ArticleEntityData
	| CollectionEntityData
	| TombstoneEntityData;

export interface BaseEntityData {
	type: string;
	content?: string;
	name?: string;
	checked?: boolean;
}

export interface DirectoryEntityData extends BaseEntityData {
	type: 'Collection';
	directory: true;
}

export interface NoteEntityData extends BaseEntityData {
	type: 'Note';
	content: string;
}

export interface ArticleEntityData extends BaseEntityData {
	type: 'Article';
	content: string;
	name: string;
}

export interface CollectionEntityData extends BaseEntityData {
	type: 'Collection';
}

export interface TombstoneEntityData extends BaseEntityData {
	type: 'Tombstone';
	formerType: string;
	deleted: Date;
	previousType: string;
}

export interface Directory extends Entity {
	path: string; // directories always have a `path`, can't be `null`
	data: DirectoryEntityData;
}
