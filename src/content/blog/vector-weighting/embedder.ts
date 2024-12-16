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

    if (env.backends.onnx?.wasm) {
      env.backends.onnx.wasm.numThreads = 1;
    }

    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
      dtype: 'int8',
      device: 'wasm',
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

  console.log(rawEmbeddings);

  const embeddings = Array.from(rawEmbeddings.data);

  return embeddings;
}
