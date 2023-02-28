import type {SvelteChild, Text} from 'svast';
import {parse} from 'svelte-parse';
import {walk} from 'estree-walker';
import {checkPersonaName} from '$lib/vocab/persona/personaHelpers';
import {
	isHubRelativePath,
	isHubRelativePathValid,
	isNetworkRelativePath,
	isNetworkRelativePathValid,
	isSpaceRelativePath,
	isSpaceRelativePathValid,
} from '$lib/util/fuz';

// Used to avoids infinite loops because newly added children get walked.
const ADDED_BY_FELT = Symbol();

// TODO sanitize using an allowlist of elements/attributes

/**
 * Wraps `svelte-parse` with Felt-specific plaintext extensions like linkifying URLs.
 * This is a hacky initial implementation just to get links and mentions.
 * We plan to use MDsveX/Pfm to do this robustly/correctly:
 * https://github.com/pngwn/MDsveX/
 * @param opts - `svelte-parse` options
 * @returns A SVAST `Root` object
 */
export const parseSvast: typeof parse = (opts) => {
	const ast = parse(opts);
	walk(ast, {
		enter(node, parent) {
			if ((node as any)[ADDED_BY_FELT]) return;
			if (node.type === 'text') {
				// Parse text and replace extended syntax with new nodes.
				// This is a temporary implementation until Pfm is ready and we write a proper plugin.
				const {type: t} = parent;
				if (t !== 'root' && t !== 'svelteElement' && t !== 'svelteComponent') return;
				const newNode = parseSvastText(node as any);
				if (newNode !== node) this.replace(newNode);
			}
		},
	});
	return ast;
};

// TODO this is hacky and temporary -- see `parseSvast` above
const parseSvastText = (node: Text): SvelteChild => {
	const words = node.value.split(MATCH_WHITESPACE);
	let plainText = '';
	let children: SvelteChild[] | undefined;
	const flushPlainText = () => {
		if (!plainText) return;
		(children || (children = [])).push({
			[ADDED_BY_FELT as any]: true,
			type: 'text',
			value: plainText,
		});
		plainText = '';
	};
	let word: string;
	let lastCharIndex: number;
	let firstChar: string;
	let restStr: string;
	let lastChar: string;
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < words.length; i++) {
		word = words[i];
		if (MATCH_WHITESPACE.test(word)) {
			plainText += word;
			continue;
		}
		lastCharIndex = word.length - 1;
		firstChar = word[0];
		lastChar = word[lastCharIndex];
		if (
			(isNetworkRelativePath(word) && isNetworkRelativePathValid(word)) ||
			(isHubRelativePath(word) && isHubRelativePathValid(word)) ||
			(isSpaceRelativePath(word) && isSpaceRelativePathValid(word)) ||
			word.startsWith('https://') ||
			word.startsWith('http://')
		) {
			// linkify text:
			// - /this becomes $HOST/$HUB/this
			// - ./there becomes $HOST/$HUB/$SPACE/there
			// - //that.net become https://that.net
			flushPlainText();
			(children || (children = [])).push({
				[ADDED_BY_FELT as any]: true,
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{[ADDED_BY_FELT as any]: true, type: 'text', value: word}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{[ADDED_BY_FELT as any]: true, type: 'text', value: word}],
			});
		} else if (firstChar === '`' && lastChar === '`') {
			// `code` tags
			flushPlainText();
			(children || (children = [])).push({
				[ADDED_BY_FELT as any]: true,
				type: 'svelteElement',
				tagName: 'code',
				properties: [],
				selfClosing: false,
				children: [
					{[ADDED_BY_FELT as any]: true, type: 'text', value: word.substring(1, lastCharIndex)},
				],
			});
		} else if (firstChar === '@' && !checkPersonaName((restStr = word.substring(1)))) {
			// `@persona` mentions
			flushPlainText();
			(children || (children = [])).push({
				[ADDED_BY_FELT as any]: true,
				type: 'svelteComponent',
				tagName: 'Mention',
				properties: [
					{
						type: 'svelteProperty',
						name: 'name',
						value: [{[ADDED_BY_FELT as any]: true, type: 'text', value: restStr}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [],
			});
		} else {
			plainText += word;
		}
	}
	if (!children) return node; // nothing special was parsed
	flushPlainText();
	return children.length === 1
		? children[0]
		: {
				[ADDED_BY_FELT as any]: true,
				type: 'svelteElement',
				tagName: 'span',
				properties: [],
				selfClosing: false,
				children,
		  };
};

const MATCH_WHITESPACE = /(\s+)/u;
