import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@ryanatkn/belt/result.js';

import type {TestServerContext} from '$lib/util/testServerHelpers.js';
import {
	CreateHubService,
	DeleteHubService,
	KickFromHubService,
	LeaveHubService,
} from '$lib/vocab/hub/hubServices.js';
import {invite, toServiceRequestFake} from '$lib/util/testHelpers.js';
import {randomHubParams} from '$lib/util/randomVocab.js';
import {setupDb, teardownDb} from '$lib/util/testDbHelpers.js';
import {Broadcast} from '$lib/server/Broadcast.js';
import {flushAfterResponseCallbacks, type AfterResponseCallback} from '$lib/server/service.js';

// These tests use bracket notation to access private fields with typesafety:
/* eslint-disable @typescript-eslint/dot-notation */

type WebsocketFake = any;

/* test__broadcast */
const test__broadcast = suite<TestServerContext>('broadcast');

test__broadcast.before(setupDb);
test__broadcast.after(teardownDb);

test__broadcast('open first socket', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket: WebsocketFake = 'socket1';
	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	await random.hub(al);
	const prod = (await random.hub(al)).hub;

	await invite(repos, al, prod.hub_id, ace.name);

	await broadcast.openSocket(socket, a.account_id);

	assert.is(broadcast['socketsByAccount'].size, 1);
	assert.is(broadcast['socketsByHub'].size, 4);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 4);
	assert.is(broadcast['hubIdsByAccount'].size, 1);

	assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 1);
	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(a.account_id)!.size, 2);
	assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 4);
});

test__broadcast('open two sockets with one account', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	await random.hub(al);
	const prod = (await random.hub(al)).hub;

	await invite(repos, al, prod.hub_id, ace.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);

	assert.is(broadcast['socketsByAccount'].size, 1);
	assert.is(broadcast['socketsByHub'].size, 4);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 4);
	assert.is(broadcast['hubIdsByAccount'].size, 1);

	assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 2);
	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(a.account_id)!.size, 2);
	assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 4);
});

test__broadcast('connect multiple sockets from multiple accounts', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	const dev = (await random.hub(al)).hub;
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 8);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 8);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 2);
	assert.is(broadcast['socketsByAccount'].get(b.account_id)!.size, 1);
	assert.is(broadcast['socketsByAccount'].get(z.account_id)!.size, 2);

	assert.is(broadcast['socketsByHub'].get(dev.hub_id)!.size, 2);
	assert.is(broadcast['socketsByHub'].get(test.hub_id)!.size, 3);
	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 5);

	assert.is(broadcast['actorIdsByAccountByHub'].get(dev.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(test.hub_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 3);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(a.account_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(b.account_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(z.account_id)!.size, 2);

	assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 4);
	assert.is(broadcast['hubIdsByAccount'].get(b.account_id)!.size, 3);
	assert.is(broadcast['hubIdsByAccount'].get(z.account_id)!.size, 4);
});

test__broadcast('close last socket for an account', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	const dev = (await random.hub(al)).hub;
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 8);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 8);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	await broadcast.closeSocket(socket3, b.account_id);

	assert.is(broadcast['socketsByAccount'].size, 2);
	assert.is(broadcast['socketsByHub'].size, 7);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 7);
	assert.is(broadcast['hubIdsByAccount'].size, 2);

	assert.is(broadcast['socketsByAccount'].get(b.account_id), undefined);

	assert.is(broadcast['socketsByHub'].get(dev.hub_id)!.size, 2);
	assert.is(broadcast['socketsByHub'].get(test.hub_id)!.size, 2);
	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 4);

	assert.is(broadcast['actorIdsByAccountByHub'].get(dev.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(test.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 2);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(b.account_id), undefined);

	assert.is(broadcast['hubIdsByAccount'].get(b.account_id), undefined);
});

test__broadcast('close one of two sockets for an account', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	const dev = (await random.hub(al)).hub;
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	await broadcast.closeSocket(socket2, a.account_id);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 8);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 8);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 1);

	assert.is(broadcast['socketsByHub'].get(dev.hub_id)!.size, 1);
	assert.is(broadcast['socketsByHub'].get(test.hub_id)!.size, 3);
	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 4);

	assert.is(broadcast['actorIdsByAccountByHub'].get(dev.hub_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(test.hub_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 3);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(a.account_id)!.size, 2);
	assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 4);
});

test__broadcast('close all open sockets', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	await broadcast.closeSocket(socket1, a.account_id);
	await broadcast.closeSocket(socket2, a.account_id);
	await broadcast.closeSocket(socket3, b.account_id);
	await broadcast.closeSocket(socket4, z.account_id);
	await broadcast.closeSocket(socket5, z.account_id);

	assert.is(broadcast['socketsByAccount'].size, 0);
	assert.is(broadcast['socketsByHub'].size, 0);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 0);
	assert.is(broadcast['hubIdsByAccount'].size, 0);
});

test__broadcast(
	'with multiple open sockets, create a hub and add an actor to it',
	async ({repos, random}) => {
		const broadcast = new Broadcast(repos);
		const socket1: WebsocketFake = 'socket1';
		const socket2: WebsocketFake = 'socket2';
		const socket3: WebsocketFake = 'socket3';
		const socket4: WebsocketFake = 'socket4';
		const socket5: WebsocketFake = 'socket5';

		const a = await random.account();
		const al = (await random.actor(a)).actor;
		const ace = (await random.actor(a)).actor;
		const b = await random.account();
		const bill = (await random.actor(b)).actor;
		const z = await random.account();
		const zed = (await random.actor(z)).actor;
		const zoe = (await random.actor(z)).actor;
		const dev = (await random.hub(al)).hub;
		const test = (await random.hub(bill)).hub;
		const prod = (await random.hub(al)).hub;

		await invite(repos, bill, test.hub_id, zed.name);
		await invite(repos, bill, test.hub_id, zoe.name);
		await invite(repos, al, prod.hub_id, ace.name);
		await invite(repos, al, prod.hub_id, bill.name);
		await invite(repos, al, prod.hub_id, zed.name);
		await invite(repos, al, prod.hub_id, zoe.name);

		await broadcast.openSocket(socket1, a.account_id);
		await broadcast.openSocket(socket2, a.account_id);
		await broadcast.openSocket(socket3, b.account_id);
		await broadcast.openSocket(socket4, z.account_id);
		await broadcast.openSocket(socket5, z.account_id);

		const {hub: demo} = unwrap(
			await CreateHubService.perform({
				...toServiceRequestFake(repos, al, undefined, undefined, broadcast),
				params: randomHubParams(al.actor_id),
			}),
		);

		assert.is(broadcast['socketsByAccount'].size, 3);
		assert.is(broadcast['socketsByHub'].size, 9);
		assert.is(broadcast['actorIdsByAccountByHub'].size, 9);
		assert.is(broadcast['hubIdsByAccount'].size, 3);

		assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 2);
		assert.is(broadcast['socketsByAccount'].get(b.account_id)!.size, 1);
		assert.is(broadcast['socketsByAccount'].get(z.account_id)!.size, 2);

		assert.is(broadcast['socketsByHub'].get(dev.hub_id)!.size, 2);
		assert.is(broadcast['socketsByHub'].get(test.hub_id)!.size, 3);
		assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 5);
		assert.is(broadcast['socketsByHub'].get(demo.hub_id)!.size, 2);

		assert.is(broadcast['actorIdsByAccountByHub'].get(dev.hub_id)!.size, 1);
		assert.is(broadcast['actorIdsByAccountByHub'].get(test.hub_id)!.size, 2);
		assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 3);
		assert.is(broadcast['actorIdsByAccountByHub'].get(demo.hub_id)!.size, 1);

		assert.is(broadcast['actorIdsByAccountByHub'].get(demo.hub_id)!.get(a.account_id)!.size, 1);

		assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 5);
		assert.is(broadcast['hubIdsByAccount'].get(b.account_id)!.size, 3);
		assert.is(broadcast['hubIdsByAccount'].get(z.account_id)!.size, 4);

		await invite(repos, al, demo.hub_id, zoe.name, broadcast);

		assert.is(broadcast['socketsByAccount'].size, 3);
		assert.is(broadcast['socketsByHub'].size, 9);
		assert.is(broadcast['actorIdsByAccountByHub'].size, 9);
		assert.is(broadcast['hubIdsByAccount'].size, 3);

		assert.is(broadcast['socketsByAccount'].get(a.account_id)!.size, 2);
		assert.is(broadcast['socketsByAccount'].get(b.account_id)!.size, 1);
		assert.is(broadcast['socketsByAccount'].get(z.account_id)!.size, 2);

		assert.is(broadcast['socketsByHub'].get(dev.hub_id)!.size, 2);
		assert.is(broadcast['socketsByHub'].get(test.hub_id)!.size, 3);
		assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 5);
		assert.is(broadcast['socketsByHub'].get(demo.hub_id)!.size, 4);

		assert.is(broadcast['actorIdsByAccountByHub'].get(dev.hub_id)!.size, 1);
		assert.is(broadcast['actorIdsByAccountByHub'].get(test.hub_id)!.size, 2);
		assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 3);
		assert.is(broadcast['actorIdsByAccountByHub'].get(demo.hub_id)!.size, 2);

		assert.is(broadcast['actorIdsByAccountByHub'].get(demo.hub_id)!.get(z.account_id)!.size, 1);

		assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 5);
		assert.is(broadcast['hubIdsByAccount'].get(b.account_id)!.size, 3);
		assert.is(broadcast['hubIdsByAccount'].get(z.account_id)!.size, 5);
	},
);

test__broadcast('with multiple open sockets, remove and kick actors', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	await random.hub(al);
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	let afterResponseCallbacks: AfterResponseCallback[] | null = null;

	unwrap(
		await KickFromHubService.perform({
			...toServiceRequestFake(repos, al, undefined, undefined, broadcast, undefined, (cb) =>
				(afterResponseCallbacks || (afterResponseCallbacks = [])).push(cb),
			),
			params: {actor: al.actor_id, actor_id: zoe.actor_id, hub_id: prod.hub_id},
		}),
	);

	assert.is(afterResponseCallbacks!.length, 1);
	await flushAfterResponseCallbacks(afterResponseCallbacks!);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 8);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 8);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 3);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(a.account_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(b.account_id)!.size, 1);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(z.account_id)!.size, 1);

	afterResponseCallbacks = null;
	unwrap(
		await LeaveHubService.perform({
			...toServiceRequestFake(repos, zed, undefined, undefined, broadcast, undefined, (cb) =>
				(afterResponseCallbacks || (afterResponseCallbacks = [])).push(cb),
			),
			params: {actor: zed.actor_id, actor_id: zed.actor_id, hub_id: prod.hub_id},
		}),
	);

	assert.is(afterResponseCallbacks!.length, 1);
	await flushAfterResponseCallbacks(afterResponseCallbacks!);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 8);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 8);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	assert.is(broadcast['socketsByHub'].get(prod.hub_id)!.size, 3);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.size, 2);
	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id)!.get(z.account_id), undefined);
	assert.is(broadcast['hubIdsByAccount'].get(z.account_id)!.size, 3);
});

test__broadcast('with multiple open sockets, delete a hub', async ({repos, random}) => {
	const broadcast = new Broadcast(repos);
	const socket1: WebsocketFake = 'socket1';
	const socket2: WebsocketFake = 'socket2';
	const socket3: WebsocketFake = 'socket3';
	const socket4: WebsocketFake = 'socket4';
	const socket5: WebsocketFake = 'socket5';

	const a = await random.account();
	const al = (await random.actor(a)).actor;
	const ace = (await random.actor(a)).actor;
	const b = await random.account();
	const bill = (await random.actor(b)).actor;
	const z = await random.account();
	const zed = (await random.actor(z)).actor;
	const zoe = (await random.actor(z)).actor;
	await random.hub(al);
	const test = (await random.hub(bill)).hub;
	const prod = (await random.hub(al)).hub;

	await invite(repos, bill, test.hub_id, zed.name);
	await invite(repos, bill, test.hub_id, zoe.name);
	await invite(repos, al, prod.hub_id, ace.name);
	await invite(repos, al, prod.hub_id, bill.name);
	await invite(repos, al, prod.hub_id, zed.name);
	await invite(repos, al, prod.hub_id, zoe.name);

	await broadcast.openSocket(socket1, a.account_id);
	await broadcast.openSocket(socket2, a.account_id);
	await broadcast.openSocket(socket3, b.account_id);
	await broadcast.openSocket(socket4, z.account_id);
	await broadcast.openSocket(socket5, z.account_id);

	unwrap(
		await DeleteHubService.perform({
			...toServiceRequestFake(repos, al, undefined, undefined, broadcast),
			params: {actor: al.actor_id, hub_id: prod.hub_id},
		}),
	);

	assert.is(broadcast['socketsByAccount'].size, 3);
	assert.is(broadcast['socketsByHub'].size, 7);
	assert.is(broadcast['actorIdsByAccountByHub'].size, 7);
	assert.is(broadcast['hubIdsByAccount'].size, 3);

	assert.is(broadcast['actorIdsByAccountByHub'].get(prod.hub_id), undefined);

	assert.is(broadcast['hubIdsByAccount'].get(a.account_id)!.size, 3);
	assert.is(broadcast['hubIdsByAccount'].get(b.account_id)!.size, 2);
	assert.is(broadcast['hubIdsByAccount'].get(z.account_id)!.size, 3);
});

test__broadcast.run();
/* test__broadcast */
