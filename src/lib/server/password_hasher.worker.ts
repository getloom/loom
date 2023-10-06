import {Worker, isMainThread, parentPort} from 'worker_threads';
import {fileURLToPath} from 'url';
import {UnreachableError} from '@grogarden/util/error.js';

import {toPasswordKey, verifyPassword} from '$lib/server/password.js';
import type {PasswordHasher} from '$lib/server/password_hasher.js';

// TODO make more generic and reusable, with configurable pooling

const worker_path = fileURLToPath(import.meta.url);

type WorkerInputMessage =
	| ExitInputMessage
	| EncryptPasswordInputMessage
	| VerifyPasswordInputMessage;
interface ExitInputMessage {
	id: number;
	method: 'exit';
	params: void;
}
interface EncryptPasswordInputMessage {
	id: number;
	method: 'encrypt';
	params: string;
}
interface VerifyPasswordInputMessage {
	id: number;
	method: 'verify';
	params: [passwordText: string, passwordKey: string];
}

type WorkerOutputMessage =
	| ExitOutputMessage
	| EncryptPasswordOutputMessage
	| VerifyPasswordOutputMessage;
// TODO this one isn't actually ever received, it's triggered through the 'exit' event, but it's used for types
interface ExitOutputMessage {
	id: number;
	method: 'exit';
	returned: void;
}
interface EncryptPasswordOutputMessage {
	id: number;
	method: 'encrypt';
	returned: string;
}
interface VerifyPasswordOutputMessage {
	id: number;
	method: 'verify';
	returned: boolean;
}

interface PendingCall {
	id: number;
	message: WorkerInputMessage;
	resolve: (...args: any[]) => void; // TODO type?
	reject: (err: any) => void; // TODO type?
}

/**
 * Returns a stateful object containing password helpers that gets called in a worker pool.
 * Use `terminate` to free the resource.
 * @returns `toPasswordKey` with a stateful worker
 */
export const create_password_hasher_worker = (): PasswordHasher => {
	let worker: Worker | null = new Worker(worker_path);
	let _id = 0;

	// Track a map of pending calls by id.
	const pending = new Map<number, PendingCall>();

	const onMessage = (m: WorkerOutputMessage) => {
		const p = pending.get(m.id)!;
		pending.delete(m.id);
		p.resolve(m.returned);
	};
	const cleanup = (error?: Error) => {
		if (!worker) return;
		for (const p of pending.values()) {
			if (p.message.method === 'exit' && !error) {
				p.resolve();
			} else {
				p.reject(error);
			}
		}
		pending.clear();
		worker.off('message', onMessage);
		worker = null;
	};
	const onError = (err: Error) => {
		cleanup(err);
	};
	const onExit = (code: number): void => {
		cleanup(code === 0 ? undefined : new Error(`Worker exited unexpectedly with code ${code}`));
	};

	worker.on('message', onMessage);
	worker.once('error', onError);
	worker.once('exit', onExit);

	const wrap = <
		TInputMessage extends WorkerInputMessage,
		TOutputMessage extends WorkerOutputMessage,
	>(
		partial: Omit<TInputMessage, 'id'>,
	): Promise<TOutputMessage['returned']> => {
		if (!worker) throw Error('worker is already closed');

		const message = {
			id: ++_id,
			method: partial.method,
			params: partial.params,
		} as TInputMessage;

		let resolve!: PendingCall['resolve'], reject!: PendingCall['reject'];
		const promise = new Promise<TOutputMessage['returned']>(
			(a, b) => ((resolve = a), (reject = b)),
		);

		pending.set(message.id, {id: message.id, message, resolve, reject});
		worker.postMessage(message);

		return promise;
	};

	const hasher: PasswordHasher = {
		encrypt: (passwordText) =>
			wrap<EncryptPasswordInputMessage, EncryptPasswordOutputMessage>({
				method: 'encrypt',
				params: passwordText,
			}),
		verify: (passwordText, passwordKey) =>
			wrap<VerifyPasswordInputMessage, VerifyPasswordOutputMessage>({
				method: 'verify',
				params: [passwordText, passwordKey],
			}),
		close: () =>
			wrap<ExitInputMessage, ExitOutputMessage>({
				method: 'exit',
				params: undefined,
			}),
	};
	return hasher;
};

const main = (): void => {
	const onMessage = (m: WorkerInputMessage) => {
		switch (m.method) {
			case 'exit': {
				parentPort!.off('message', onMessage);
				break;
			}
			case 'encrypt': {
				void toPasswordKey(m.params).then((hashed) => {
					const o: EncryptPasswordOutputMessage = {id: m.id, method: 'encrypt', returned: hashed};
					parentPort!.postMessage(o);
				});
				break;
			}
			case 'verify': {
				void verifyPassword(m.params[0], m.params[1]).then((hashed) => {
					const o: VerifyPasswordOutputMessage = {id: m.id, method: 'verify', returned: hashed};
					parentPort!.postMessage(o);
				});
				break;
			}
			default:
				throw new UnreachableError(m);
		}
	};
	parentPort!.on('message', onMessage);
};

if (!isMainThread) {
	main();
}
