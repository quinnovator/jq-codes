'use client';

import { useState } from 'react';
import { getEventsByQuery } from './vector-utils';

type Event = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

export function BasicQueryDemo() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsSearching(true);

    try {
      const matchedEvents = await getEventsByQuery(query);
      setResults(matchedEvents);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe what kind of event you're looking for..."
          className="w-full rounded border p-2 dark:bg-gray-800"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search Events'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-semibold">Matching Events:</h4>
          <div className="space-y-2">
            {results.map((event) => (
              <div
                key={event.id}
                className="rounded border p-3 dark:bg-gray-800"
              >
                <div className="font-medium">{event.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.description}
                </div>
                <div className="mt-1 text-sm text-gray-500">
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