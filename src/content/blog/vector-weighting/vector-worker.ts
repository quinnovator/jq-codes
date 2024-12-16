import {
  type FeatureExtractionPipeline,
  type Tensor,
  env,
  pipeline,
} from '@huggingface/transformers';

let embedder: FeatureExtractionPipeline;

async function loadEmbedder() {
  if (!embedder) {
    env.allowLocalModels = false;

    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'int8',
      device: 'wasm',
    });
  }
  return embedder;
}

async function getEmbeddingForText(text: string): Promise<number[]> {
  const model = await loadEmbedder();

  const rawEmbeddings: Tensor = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  const embeddings = Array.from(rawEmbeddings.data);

  return embeddings;
}

// Service Worker message handling
self.addEventListener('message', async (event) => {
  if (event.data.type === 'GET_EMBEDDING') {
    try {
      const embeddings = await getEmbeddingForText(event.data.text);
      self.postMessage({
        type: 'EMBEDDING_RESULT',
        id: event.data.id,
        embeddings,
      });
    } catch (error) {
      self.postMessage({
        type: 'EMBEDDING_ERROR',
        id: event.data.id,
        error: error.message,
      });
    }
  }
});
