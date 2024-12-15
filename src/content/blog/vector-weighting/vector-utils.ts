import { queryEventsByVector } from './db';
import { getEmbeddingForText } from './embedder';
import { useVectorStore } from './vector-store';

// Query events by a standard query (no weighting)
export async function getEventsByQuery(query: string, limit = 5) {
  const queryVector = await getEmbeddingForText(query);
  return queryEventsByVector(queryVector, limit);
}

// Basic vector similarity function
export function cosineSimilarity(a: number[], b: number[]) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return 0;
  }

  if (a.length !== b.length) {
    return 0;
  }

  const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, x) => sum + x * x, 0));
  const normB = Math.sqrt(b.reduce((sum, x) => sum + x * x, 0));

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dot / (normA * normB);

  if (Number.isNaN(similarity)) {
    return 0;
  }

  return similarity;
}

// Weighted query: Adjust scores based on user preferences using vector embeddings
export async function getEventsByWeightedQuery(
  query: string,
  preferences: {
    outdoors: boolean;
    artsy: boolean;
    techFocused: boolean;
    noisy: boolean;
    crowded: boolean;
  },
  limit = 5,
) {
  // First get base events by vector similarity
  const queryVector = await getEmbeddingForText(query);
  const baseEvents = await queryEventsByVector(queryVector, 100);

  // Get preference vectors from store
  const store = useVectorStore.getState();
  if (!store.preferenceVectors) {
    throw new Error('Preference vectors not initialized');
  }
  const preferenceVectors = store.preferenceVectors;

  // Apply preference-based scoring adjustments using vector similarity
  const adjusted = baseEvents.map((evt) => {
    let finalScore = evt.score;
    const eventVector = evt.vector;

    // Add positive preferences
    if (preferences.outdoors) {
      finalScore +=
        cosineSimilarity(eventVector, preferenceVectors.outdoors) * 0.2;
    }
    if (preferences.artsy) {
      finalScore +=
        cosineSimilarity(eventVector, preferenceVectors.artsy) * 0.2;
    }
    if (preferences.techFocused) {
      finalScore +=
        cosineSimilarity(eventVector, preferenceVectors.techFocused) * 0.2;
    }

    // Subtract negative preferences
    if (preferences.noisy) {
      finalScore -=
        cosineSimilarity(eventVector, preferenceVectors.noisy) * 0.6;
    }
    if (preferences.crowded) {
      finalScore -=
        cosineSimilarity(eventVector, preferenceVectors.crowded) * 0.6;
    }

    return { ...evt, score: finalScore };
  });

  adjusted.sort((a, b) => b.score - a.score);

  return adjusted.slice(0, limit);
}
