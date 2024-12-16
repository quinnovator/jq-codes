'use client';

let worker: Worker | null = null;
let nextRequestId = 1;
const pendingRequests = new Map<
  number,
  { resolve: (value: number[]) => void; reject: (error: Error) => void }
>();

function initWorker() {
  if (!worker && typeof window !== 'undefined') {
    worker = new Worker(new URL('./vector-worker.ts', import.meta.url), {
      type: 'module',
    });

    worker.onmessage = (event) => {
      const { type, id, embeddings, error } = event.data;
      const request = pendingRequests.get(id);

      if (request) {
        if (type === 'EMBEDDING_RESULT') {
          request.resolve(embeddings);
        } else if (type === 'EMBEDDING_ERROR') {
          request.reject(new Error(error));
        }
        pendingRequests.delete(id);
      }
    };
  }
}

export async function getEmbeddingForText(text: string): Promise<number[]> {
  initWorker();

  if (!worker) {
    throw new Error('Service worker could not be initialized');
  }

  return new Promise((resolve, reject) => {
    const requestId = nextRequestId++;
    pendingRequests.set(requestId, { resolve, reject });

    worker?.postMessage({
      type: 'GET_EMBEDDING',
      id: requestId,
      text,
    });
  });
}
