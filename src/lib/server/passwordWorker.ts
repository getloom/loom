import {Worker, isMainThread, parentPort, workerData} from 'worker_threads';
import {fileURLToPath} from 'url';

import {hashPassword} from '$lib/server/password';

// TODO configurable pooling

const workerPath = fileURLToPath(import.meta.url);

export const passwordWorker = (password: string): void | Promise<string> => {
	if (!isMainThread) return;
	return new Promise((resolve, reject) => {
		// TODO create one worker and reuse it
		const worker = new Worker(workerPath, {workerData: password});
		worker.on('message', resolve);
		worker.on('error', reject);
		worker.on('exit', (code) => {
			if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
		});
	});
};

if (!isMainThread) {
	void hashPassword(workerData).then((hashed) => {
		parentPort!.postMessage(hashed);
	});
}
