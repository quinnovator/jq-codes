import { getEmbeddingForText } from './embedder';

const preferenceVectors: Record<string, number[]> = {};

async function loadPreferenceVectors() {
  const prefs: Record<string, string> = {
    outdoor: 'I love outdoor adventures and nature activities.',
    tech: "I'm interested in technology conferences, hackathons, and workshops.",
    art: 'I enjoy visiting art exhibitions, galleries, and cultural events.',
  };

  for (const k of Object.keys(prefs)) {
    preferenceVectors[k] = await getEmbeddingForText(prefs[k]);
  }
}

export async function getPreferenceVectors(): Promise<
  Record<string, number[]>
> {
  if (Object.keys(preferenceVectors).length === 0) {
    await loadPreferenceVectors();
  }

  return preferenceVectors;
}
