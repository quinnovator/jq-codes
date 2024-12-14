import { useCallback, useEffect, useState } from 'react';
import { queryEventsByVector } from './db';
import { getEmbeddingForText } from './embedder';
import { seedDemoEvents } from './seed';
import { weightedCombination } from './vector-math';
import { VectorPlot } from './vector-plot';

const DEFAULT_PREFERENCES = {
  outdoor: 'I love outdoor adventures and nature activities.',
  tech: "I'm interested in technology conferences, hackathons, and workshops.",
  art: 'I enjoy visiting art exhibitions, galleries, and cultural events.',
};

export function PreferenceDemo() {
  const [outdoor, setOutdoor] = useState(0.33);
  const [tech, setTech] = useState(0.33);
  const [art, setArt] = useState(0.34);
  const [preferenceTexts, setPreferenceTexts] = useState(DEFAULT_PREFERENCES);
  const [events, setEvents] = useState<
    {
      id: string;
      name: string;
      description: string;
      vector: number[];
      score: number;
    }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [themeUpdate, setThemeUpdate] = useState(0);

  const updatePreferenceVectors = useCallback(async () => {
    const vectors: Record<string, number[]> = {};

    for (const [key, text] of Object.entries(preferenceTexts)) {
      vectors[key] = await getEmbeddingForText(text);
    }

    return vectors;
  }, [preferenceTexts]);

  useEffect(() => {
    let isMounted = true;

    async function initializeAndFetch() {
      setLoading(true);
      await seedDemoEvents();
      await updatePreferenceVectors();

      if (isMounted) {
        setLoading(false);
      }
    }

    initializeAndFetch();

    return () => {
      isMounted = false;
    };
  }, [updatePreferenceVectors]);

  useEffect(() => {
    if (loading) return;

    async function fetchEvents() {
      const vectors = await updatePreferenceVectors();
      const weights = { outdoor, tech, art };
      const combined = weightedCombination(weights, vectors);
      const topEvents = await queryEventsByVector(combined, 5);
      setEvents(topEvents);
    }

    fetchEvents();
  }, [outdoor, tech, art, loading, updatePreferenceVectors]);

  useEffect(() => {
    function handleThemeChange() {
      setThemeUpdate((prev) => prev + 1);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'class'
        ) {
          handleThemeChange();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  function handleTextChange(
    category: keyof typeof DEFAULT_PREFERENCES,
    value: string,
  ) {
    setPreferenceTexts((prev) => ({
      ...prev,
      [category]: value,
    }));
  }

  const handleWeightChange = useCallback(
    (category: 'outdoor' | 'tech' | 'art', newValue: number) => {
      const others = {
        outdoor: category !== 'outdoor' ? outdoor : null,
        tech: category !== 'tech' ? tech : null,
        art: category !== 'art' ? art : null,
      };

      // Calculate total of other weights
      const totalOthers = Object.values(others).reduce(
        (sum, val) => (sum || 0) + (val || 0),
        0,
      );

      if (!totalOthers) {
        return;
      }

      // Adjust other weights proportionally
      if (totalOthers > 0) {
        const ratio = (1 - newValue) / totalOthers;
        if (category !== 'outdoor') setOutdoor((prev) => prev * ratio);
        if (category !== 'tech') setTech((prev) => prev * ratio);
        if (category !== 'art') setArt((prev) => prev * ratio);
      }

      // Set the new value for the changed category
      if (category === 'outdoor') setOutdoor(newValue);
      if (category === 'tech') setTech(newValue);
      if (category === 'art') setArt(newValue);
    },
    [outdoor, tech, art],
  );

  if (loading) {
    return <div>Loading demo data...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h3>Customize Your Preferences</h3>
      <div className="space-y-6">
        <div>
          <label htmlFor="outdoor-text" className="mb-2 block">
            Outdoor Preference Description:
          </label>
          <textarea
            id="outdoor-text"
            value={preferenceTexts.outdoor}
            onChange={(e) => handleTextChange('outdoor', e.target.value)}
            className="w-full rounded border bg-background p-2 text-foreground"
            rows={2}
          />
          <label htmlFor="outdoor-slider" className="mt-2 block">
            Weight: {(outdoor * 100).toFixed()}%
          </label>
          <input
            id="outdoor-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={outdoor}
            onChange={(e) =>
              handleWeightChange('outdoor', Number.parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="tech-text" className="mb-2 block">
            Tech Preference Description:
          </label>
          <textarea
            id="tech-text"
            value={preferenceTexts.tech}
            onChange={(e) => handleTextChange('tech', e.target.value)}
            className="w-full rounded border bg-background p-2 text-foreground"
            rows={2}
          />
          <label htmlFor="tech-slider" className="mt-2 block">
            Weight: {(tech * 100).toFixed()}%
          </label>
          <input
            id="tech-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={tech}
            onChange={(e) =>
              handleWeightChange('tech', Number.parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="art-text" className="mb-2 block">
            Art Preference Description:
          </label>
          <textarea
            id="art-text"
            value={preferenceTexts.art}
            onChange={(e) => handleTextChange('art', e.target.value)}
            className="w-full rounded border bg-background p-2 text-foreground"
            rows={2}
          />
          <label htmlFor="art-slider" className="mt-2 block">
            Weight: {(art * 100).toFixed()}%
          </label>
          <input
            id="art-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={art}
            onChange={(e) =>
              handleWeightChange('art', Number.parseFloat(e.target.value))
            }
            className="w-full"
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Total: {((outdoor + tech + art) * 100).toFixed()}%
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <VectorPlot
          events={events}
          outdoor={outdoor}
          tech={tech}
          art={art}
          key={themeUpdate}
        />
      </div>

      <h4>Top Matching Events</h4>
      <ul>
        {events.map((evt) => (
          <li key={evt.id}>
            <strong>{evt.name}</strong> - {evt.description} (Score:{' '}
            {evt.score.toFixed(2)})
          </li>
        ))}
      </ul>
    </div>
  );
}
