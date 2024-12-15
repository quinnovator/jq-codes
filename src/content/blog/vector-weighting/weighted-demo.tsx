'use client';

import { useEffect, useState } from 'react';
import { getTopEventsForPreferences } from './vector-utils';

type Event = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

type WeightScheme = {
  name: string;
  weights: {
    outdoor: number;
    tech: number;
    art: number;
  };
};

const preferenceVectors = {
  outdoor: [0.8, 0.1, 0.1],
  tech: [0.1, 0.8, 0.1],
  art: [0.1, 0.1, 0.8],
};

const weightSchemes: WeightScheme[] = [
  {
    name: 'Balanced',
    weights: { outdoor: 0.33, tech: 0.33, art: 0.33 },
  },
  {
    name: 'Tech Focus',
    weights: { outdoor: 0.1, tech: 0.8, art: 0.1 },
  },
  {
    name: 'Outdoor Adventure',
    weights: { outdoor: 0.7, tech: 0.2, art: 0.1 },
  },
  {
    name: 'Art & Tech',
    weights: { outdoor: 0.1, tech: 0.45, art: 0.45 },
  },
];

const DEFAULT_PREFERENCES = {
  outdoor: 'I love outdoor adventures and nature activities.',
  tech: "I'm interested in technology conferences, hackathons, and workshops.",
  art: 'I enjoy visiting art exhibitions, galleries, and cultural events.',
};

export function WeightedDemo() {
  const [selectedScheme, setSelectedScheme] = useState<WeightScheme>(
    weightSchemes[0],
  );
  const [results, setResults] = useState<Event[]>([]);
  const [customWeights, setCustomWeights] = useState({
    outdoor: 0.33,
    tech: 0.33,
    art: 0.33,
  });
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    updateResults(selectedScheme.weights);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScheme.weights]);

  async function updateResults(weights: Record<string, number>) {
    const topEvents = await getTopEventsForPreferences(weights, DEFAULT_PREFERENCES, 5);
    setResults(topEvents);
  }

  function handleSchemeChange(scheme: WeightScheme) {
    setSelectedScheme(scheme);
    setIsCustom(false);
    updateResults(scheme.weights);
  }

  function handleCustomWeightChange(
    category: keyof typeof customWeights,
    value: number,
  ) {
    const newWeights = { ...customWeights, [category]: value };
    const total = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    const normalizedWeights = {
      outdoor: newWeights.outdoor / total,
      tech: newWeights.tech / total,
      art: newWeights.art / total,
    };

    setCustomWeights(normalizedWeights);
    setIsCustom(true);
    updateResults(normalizedWeights);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="font-semibold">Preset Weight Schemes:</h4>
        <div className="flex flex-wrap gap-2">
          {weightSchemes.map((scheme) => (
            <button
              type="button"
              key={scheme.name}
              onClick={() => handleSchemeChange(scheme)}
              className={`rounded px-3 py-1 ${
                selectedScheme.name === scheme.name && !isCustom
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {scheme.name}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Custom Weights:</h4>
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(customWeights).map(([category, weight]) => (
            <div key={category} className="space-y-1">
              <label
                htmlFor={`weight-${category}`}
                className="block capitalize"
              >
                {category}
              </label>
              <input
                id={`weight-${category}`}
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={weight}
                onChange={(e) =>
                  handleCustomWeightChange(
                    category as keyof typeof customWeights,
                    Number.parseFloat(e.target.value),
                  )
                }
                className="w-full"
              />
              <div className="text-sm text-gray-600">
                {(weight * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Results:</h4>
        <div className="space-y-2">
          {results.map((event) => (
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
      </div>
    </div>
  );
}