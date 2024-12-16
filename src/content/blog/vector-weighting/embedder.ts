'use client';

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

    embedder = await pipeline('feature-extraction', undefined, {
      device: 'wasm',
      dtype: 'int8',
    });
  }
  return embedder;
}

export async function getEmbeddingForText(text: string): Promise<number[]> {
  const model = await loadEmbedder();

  const rawEmbeddings: Tensor = await model(text, {
    pooling: 'mean',
    normalize: true,
  });

  const embeddings = Array.from(rawEmbeddings.data);

  return embeddings;
}
