export function weightedCombination(
  weights: Record<string, number>,
  vectors: Record<string, number[]>,
): number[] {
  const keys = Object.keys(weights);

  if (keys.length === 0) {
    return [];
  }

  if (!vectors[keys[0]]) {
    return [];
  }

  const length = vectors[keys[0]].length;
  const combined = new Array(length).fill(0);

  let totalWeight = 0;

  for (const k of keys) {
    const w = weights[k];
    totalWeight += w;
    const vec = vectors[k];

    if (!vec) {
      continue;
    }

    if (vec.length !== length) {
      continue;
    }

    for (let i = 0; i < length; i++) {
      combined[i] += vec[i] * w;
    }
  }

  if (totalWeight <= 0) {
    return combined;
  }

  for (let i = 0; i < length; i++) {
    combined[i] = combined[i] / totalWeight;
  }

  return combined;
}

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
