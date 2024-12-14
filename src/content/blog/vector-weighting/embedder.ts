import {
  type FeatureExtractionPipeline,
  type Tensor,
  pipeline,
} from '@xenova/transformers';

let embedder: FeatureExtractionPipeline;

async function loadEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction');
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
