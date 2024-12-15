'use client';

import { useState } from 'react';
import { getEventsByQuery } from './vector-utils';
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

    // Calculate similarities with preference vectors
    const events = await getEventsByQuery(query);
    // We'll mimic prior logic by recalculating weights based on query embedding
    // but now we just have events from a single function call.

    // For demonstration, we recalculate weights:
    // Normally you'd re-embed the query, but let's assume events came from that embedding.
    if (events.length > 0 && events[0].vector && events[0].vector.length === preferenceVectors.outdoor.length) {
      // This is a simplification: in a real scenario, we would re-embed `query` here,
      // but our getEventsByQuery already did the embedding internally.
      // We'll assume queryVector ~ events[0].vector for demonstration, which is not strictly correct.
      const queryVector = events[0].vector;
      const similarities: Record<string, number> = {};
      let totalSimilarity = 0;

      Object.entries(preferenceVectors).forEach(([key, vec]) => {
        const similarity = cosineSimilarity(queryVector, vec);
        similarities[key] = similarity;
        totalSimilarity += similarity;
      });

      const normalizedWeights: Record<string, number> = {};
      Object.entries(similarities).forEach(([key, similarity]) => {
        normalizedWeights[key] = similarity / totalSimilarity;
      });

      setWeights(normalizedWeights);
    }

    setResults(events);
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