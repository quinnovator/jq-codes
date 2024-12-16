'use client';

import { useState } from 'react';
import { useVectorStore } from './vector-store';
import { getEventsByQuery, getEventsByWeightedQuery } from './vector-utils';

type Event = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

type PreferenceOption = {
  key: keyof typeof defaultPreferences;
  label: string;
  description: string;
};

const defaultPreferences = {
  outdoors: false,
  artsy: false,
  techFocused: false,
  noisy: false,
  crowded: false,
};

const preferenceOptions: PreferenceOption[] = [
  {
    key: 'outdoors',
    label: 'Outdoor Activities',
    description: 'Events that take place in nature or outdoors',
  },
  {
    key: 'artsy',
    label: 'Art & Culture',
    description: 'Events focused on art and cultural experiences',
  },
  {
    key: 'techFocused',
    label: 'Technology',
    description: 'Events centered around technology and innovation',
  },
  {
    key: 'noisy',
    label: 'Avoid Noisy',
    description: 'Exclude events with loud environments',
  },
  {
    key: 'crowded',
    label: 'Avoid Crowds',
    description: 'Exclude events with large crowds',
  },
];

function ResultsList({ events }: { events: Event[] }) {
  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div key={event.id} className="rounded border p-3 dark:bg-gray-800">
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
  );
}

export function UnifiedSearchDemo() {
  const [query, setQuery] = useState('');
  const [basicResults, setBasicResults] = useState<Event[]>([]);
  const [weightedResults, setWeightedResults] = useState<Event[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const { preferenceVectors } = useVectorStore();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !preferenceVectors) return;

    setIsSearching(true);
    try {
      const [basic, weighted] = await Promise.all([
        getEventsByQuery(query),
        getEventsByWeightedQuery(query, preferences, preferenceVectors),
      ]);
      setBasicResults(basic);
      setWeightedResults(weighted);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }

  function handlePreferenceChange(key: keyof typeof preferences) {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="space-y-4">
        <div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe what kind of event you're looking for..."
            className="w-full rounded border p-2 dark:bg-gray-800"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {preferenceOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center space-x-2 rounded border p-2 dark:bg-gray-800"
            >
              <input
                type="checkbox"
                id={option.key}
                checked={preferences[option.key]}
                onChange={() => handlePreferenceChange(option.key)}
                className="h-4 w-4"
              />
              <div>
                <label htmlFor={option.key} className="text-sm font-medium">
                  {option.label}
                </label>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={isSearching || !preferenceVectors}
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search Events'}
        </button>
      </form>

      {(basicResults.length > 0 || weightedResults.length > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-lg font-semibold">Basic Search Results</h3>
            <ResultsList events={basicResults} />
          </div>
          <div>
            <h3 className="mb-3 text-lg font-semibold">
              Preference-Weighted Results
            </h3>
            <ResultsList events={weightedResults} />
          </div>
        </div>
      )}
    </div>
  );
}
