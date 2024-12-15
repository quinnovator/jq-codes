import { getEmbeddingForText } from './embedder';
import { queryEventsByVector } from './db';
import { weightedCombination } from './vector-math';

export async function updatePreferenceVectors(preferenceTexts: Record<string, string>): Promise<Record<string, number[]>> {
  const vectors: Record<string, number[]> = {};
  for (const [key, text] of Object.entries(preferenceTexts)) {
    vectors[key] = await getEmbeddingForText(text);
  }
  return vectors;
}

export async function getTopEventsForPreferences(
  weights: Record<string, number>,
  preferenceTexts: Record<string, string>,
  limit = 5
) {
  const vectors = await updatePreferenceVectors(preferenceTexts);
  const combined = weightedCombination(weights, vectors);
  const top = await queryEventsByVector(combined, limit);
  return top;
}

export async function getEventsByQuery(query: string, limit = 5) {
  const queryVector = await getEmbeddingForText(query);
  return queryEventsByVector(queryVector, limit);
}