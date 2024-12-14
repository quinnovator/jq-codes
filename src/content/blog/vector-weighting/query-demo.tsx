'use client';

import { useState } from 'react';
import { queryEventsByVector } from './db';
import { getEmbeddingForText } from './embedder';
import { cosineSimilarity } from './vector-math';

type Event = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

const preferenceVectors = {
  outdoor: [0.8, 0.1, 0.1],
  tech: [0.1, 0.8, 0.1],
  art: [0.1, 0.1, 0.8],
};

export function QueryDemo() {
  const [query, setQuery] = useState('');
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Event[]>([]);

  async function handleQuerySubmit(e: React.FormEvent) {
    e.preventDefault();

    // Get query embedding
    const queryVector = await getEmbeddingForText(query);

    // Calculate similarities with preference vectors
    const similarities: Record<string, number> = {};
    let totalSimilarity = 0;

    Object.entries(preferenceVectors).forEach(([key, vec]) => {
      const similarity = cosineSimilarity(queryVector, vec);
      similarities[key] = similarity;
      totalSimilarity += similarity;
    });

    // Normalize similarities to get weights
    const normalizedWeights: Record<string, number> = {};
    Object.entries(similarities).forEach(([key, similarity]) => {
      normalizedWeights[key] = similarity / totalSimilarity;
    });

    setWeights(normalizedWeights);

    // Create weighted query vector
    const weightedQuery = queryVector.map((_, i) =>
      Object.entries(preferenceVectors).reduce(
        (sum, [key, vec]) => sum + vec[i] * normalizedWeights[key],
        0,
      ),
    );

    // Query events
    const matchedEvents = await queryEventsByVector(weightedQuery);
    setResults(matchedEvents);
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleQuerySubmit} className="space-y-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query (e.g., 'outdoor tech event')"
          className="w-full rounded border p-2 dark:bg-gray-800"
        />
        <button
          type="submit"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Search
        </button>
      </form>

      {Object.keys(weights).length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Generated Weights:</h4>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(weights).map(([key, weight]) => (
              <div
                key={key}
                className="rounded bg-gray-100 p-2 dark:bg-gray-800"
              >
                <div className="font-medium capitalize">{key}</div>
                <div>{(weight * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Matching Events:</h4>
          <div className="space-y-2">
            {results.map((event) => (
              <div
                key={event.id}
                className="rounded border p-2 dark:bg-gray-800"
              >
                <div className="font-medium">{event.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </div>
                <div className="text-sm text-gray-500">
                  Match: {(event.score * 100).toFixed(1)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
