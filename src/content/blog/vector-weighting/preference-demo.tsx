'use client';

import { VectorPlot } from './vector-plot';
import { useVectorStore } from './vector-store';

export function PreferenceDemo() {
  const {
    loading,
    weights: { outdoor, tech, art },
    preferenceTexts,
    setWeight,
    setPreferenceText,
    topEvents,
    themeUpdate,
  } = useVectorStore();

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
            onChange={(e) => setPreferenceText('outdoor', e.target.value)}
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
              setWeight('outdoor', Number.parseFloat(e.target.value))
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
            onChange={(e) => setPreferenceText('tech', e.target.value)}
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
              setWeight('tech', Number.parseFloat(e.target.value))
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
            onChange={(e) => setPreferenceText('art', e.target.value)}
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
              setWeight('art', Number.parseFloat(e.target.value))
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
          events={topEvents}
          outdoor={outdoor}
          tech={tech}
          art={art}
          key={themeUpdate}
        />
      </div>
    </div>
  );
}
