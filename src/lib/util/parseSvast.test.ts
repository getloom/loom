import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {parseSvast} from '$lib/util/parseSvast.js';

/* test__parseSvast */
const test__parseSvast = suite('parseSvast');

test__parseSvast('parses a normal SVAST', async () => {
	const parsed = parseSvast({
		value: '<BigPenguinInATrenchboat><SveveralLittlePenguins /></BigPenguinInATrenchboat />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'BigPenguinInATrenchboat',
				properties: [],
				selfClosing: false,
				children: [
					{
						type: 'svelteComponent',
						tagName: 'SveveralLittlePenguins',
						properties: [],
						selfClosing: true,
						children: [],
					},
				],
			},
		],
	});
});

test__parseSvast('parses https:// links', async () => {
	const parsed = parseSvast({
		value: 'https://getloom.org/some_hub',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'https://getloom.org/some_hub'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: 'https://getloom.org/some_hub'}],
			},
		],
	});
});

test__parseSvast('parses http:// links', async () => {
	const parsed = parseSvast({
		value: 'http://getloom.org/some_hub',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'http://getloom.org/some_hub'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: 'http://getloom.org/some_hub'}],
			},
		],
	});
});

test__parseSvast('parses absolute links', async () => {
	const parsed = parseSvast({
		value: '/loom/some_hub',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: '/loom/some_hub'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: '/loom/some_hub'}],
			},
		],
	});
});

test__parseSvast('parses relative links', async () => {
	const parsed = parseSvast({
		value: './some_path/some_link',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'Link',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: './some_path/some_link'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: false,
				children: [{type: 'text', value: './some_path/some_link'}],
			},
		],
	});
});

test__parseSvast('parses a SVAST with links and preserves whitespace', async () => {
	const parsed = parseSvast({
		value:
			'<BigPenguinInATrenchboat>link to <p>/sveveral/little/penguins\n<span>https://sveveral.more</span></p> in\nplain   text  \n  </BigPenguinInATrenchboat />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteComponent',
				tagName: 'BigPenguinInATrenchboat',
				properties: [],
				selfClosing: false,
				children: [
					{type: 'text', value: 'link to '},
					{
						type: 'svelteElement',
						tagName: 'p',
						properties: [],
						selfClosing: false,
						children: [
							{
								type: 'svelteElement',
								tagName: 'span',
								properties: [],
								selfClosing: false,
								children: [
									{
										type: 'svelteComponent',
										tagName: 'Link',
										properties: [
											{
												type: 'svelteProperty',
												name: 'href',
												value: [{type: 'text', value: '/sveveral/little/penguins'}],
												modifiers: [],
												shorthand: 'none',
											},
										],
										selfClosing: false,
										children: [{type: 'text', value: '/sveveral/little/penguins'}],
									},
									{type: 'text', value: '\n'},
								],
							},
							{
								type: 'svelteElement',
								tagName: 'span',
								properties: [],
								selfClosing: false,
								children: [
									{
										type: 'svelteComponent',
										tagName: 'Link',
										properties: [
											{
												type: 'svelteProperty',
												name: 'href',
												value: [{type: 'text', value: 'https://sveveral.more'}],
												modifiers: [],
												shorthand: 'none',
											},
										],
										selfClosing: false,
										children: [{type: 'text', value: 'https://sveveral.more'}],
									},
								],
							},
						],
					},
					{type: 'text', value: ' in\nplain   text  \n  '},
				],
			},
		],
	});
});

test__parseSvast('does not parse https:// links in properties', async () => {
	const parsed = parseSvast({
		value: '<a href="https://getloom.org/some_hub" />',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteElement',
				tagName: 'a',
				properties: [
					{
						type: 'svelteProperty',
						name: 'href',
						value: [{type: 'text', value: 'https://getloom.org/some_hub'}],
						modifiers: [],
						shorthand: 'none',
					},
				],
				selfClosing: true,
				children: [],
			},
		],
	});
});

test__parseSvast('parses a word in backticks', async () => {
	const parsed = parseSvast({
		value: '`some-code`',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteElement',
				tagName: 'code',
				properties: [],
				selfClosing: false,
				children: [{type: 'text', value: 'some-code'}],
			},
		],
	});
});

test__parseSvast('parses a word in asterisks', async () => {
	const parsed = parseSvast({
		value: '*bold*',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteElement',
				tagName: 'strong',
				properties: [],
				selfClosing: false,
				children: [{type: 'text', value: 'bold'}],
			},
		],
	});
});

test__parseSvast('parses a word in italics', async () => {
	const parsed = parseSvast({
		value: '_italics_',
		generatePositions: false,
	});
	assert.equal(parsed, {
		type: 'root',
		children: [
			{
				type: 'svelteElement',
				tagName: 'em',
				properties: [],
				selfClosing: false,
				children: [{type: 'text', value: 'italics'}],
			},
		],
	});
});

// TODO rewrite `parseSvelteText` to handle this test
// test__parseSvast('parses a phrase in backticks', async () => {
// 	const parsed = parseSvast({
// 		value: '`some phrase with many words`',
// 		generatePositions: false,
// 	});
// 	assert.equal(parsed, {
// 		type: 'root',
// 		children: [
// 			{
// 				type: 'svelteElement',
// 				tagName: 'code',
// 				properties: [],
// 				selfClosing: false,
// 				children: [{type: 'text', value: 'some phrase with many words'}],
// 			},
// 		],
// 	});
// });

test__parseSvast.run();
/* test__parseSvast */
