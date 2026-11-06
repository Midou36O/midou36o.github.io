import { BackgroundEngine } from './engine.ts';
import type { BackgroundCommand, BackgroundEvent } from './messages.ts';

type BackgroundWorkerScope = {
	postMessage(event: BackgroundEvent, transfer: Transferable[]): void;
	onmessage: ((event: MessageEvent<BackgroundCommand>) => void) | null;
	onmessageerror: (() => void) | null;
	close(): void;
};

// Keep the normal DOM library for the app instead of also loading conflicting worker globals.
const scope = globalThis as unknown as BackgroundWorkerScope;
const emit = (event: BackgroundEvent, transfer: Transferable[] = []) =>
	scope.postMessage(event, transfer);
let engine: BackgroundEngine | null = null;

scope.onmessage = (event) => {
	try {
		engine ??= new BackgroundEngine(emit);
		engine.handle(event.data);
		if (event.data?.type === 'destroy') scope.close();
	} catch (error) {
		if (engine) engine.fail(error);
		else {
			emit({
				type: 'error',
				message: error instanceof Error ? error.message : 'Background worker failed'
			});
		}
		scope.close();
	}
};

scope.onmessageerror = () => {
	const error = new Error('Unable to read a background worker command');
	if (engine) engine.fail(error);
	else emit({ type: 'error', message: error.message });
	scope.close();
};
