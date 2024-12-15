'use client';

import { create } from 'zustand';
import { initDB, queryEventsByVector } from './db';
import { getEmbeddingForText } from './embedder';
import { seedDemoEvents } from './seed';
import { weightedCombination } from './vector-math';

type DemoEvent = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

type PreferenceWeights = {
  outdoor: number;
  tech: number;
  art: number;
};

type PreferenceTexts = {
  outdoor: string;
  tech: string;
  art: string;
};

const DEFAULT_PREFERENCES = {
  outdoor: 'I love outdoor adventures and nature activities.',
  tech: "I'm interested in technology conferences, hackathons, and workshops.",
  art: 'I enjoy visiting art exhibitions, galleries, and cultural events.',
};

const DEFAULT_WEIGHTS = {
  outdoor: 0.33,
  tech: 0.33,
  art: 0.34,
};

type VectorStore = {
  events: DemoEvent[];
  topEvents: DemoEvent[];
  loading: boolean;
  initialized: boolean;
  weights: PreferenceWeights;
  preferenceTexts: PreferenceTexts;
  themeUpdate: number;
  initialize: () => Promise<void>;
  setWeight: (category: keyof PreferenceWeights, value: number) => void;
  setPreferenceText: (category: keyof PreferenceTexts, value: string) => void;
  updateTheme: () => void;
};

export const useVectorStore = create<VectorStore>((set, get) => ({
  events: [],
  topEvents: [],
  loading: false,
  initialized: false,
  weights: DEFAULT_WEIGHTS,
  preferenceTexts: DEFAULT_PREFERENCES,
  themeUpdate: 0,

  initialize: async () => {
    const state = get();
    if (state.initialized) return;

    try {
      set({ loading: true });
      await seedDemoEvents();
      const collection = await initDB();
      const docs = await collection.find().exec();
      const events = docs.map((doc) => doc.toJSON());

      if (events.length === 0) {
        console.error('No events found after initialization');
        return;
      }

      set({ events, initialized: true, loading: false });

      // Initial top events calculation
      const vectors = await updatePreferenceVectors(state.preferenceTexts);
      const combined = weightedCombination(state.weights, vectors);
      const top = await queryEventsByVector(combined, 5);
      set({ topEvents: top });
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      set({ loading: false });
    }
  },

  setWeight: (category, newValue) => {
    set((state) => {
      const others = Object.entries(state.weights)
        .filter(([key]) => key !== category)
        .reduce((acc, [key, value]) => {
          acc[key as keyof PreferenceWeights] = value;
          return acc;
        }, {} as PreferenceWeights);

      const totalOthers = Object.values(others).reduce(
        (sum, val) => sum + val,
        0,
      );
      if (totalOthers === 0) return state;

      const ratio = (1 - newValue) / totalOthers;
      const newWeights = Object.fromEntries(
        Object.entries(state.weights).map(([key, value]) => [
          key,
          key === category ? newValue : value * ratio,
        ]),
      ) as PreferenceWeights;

      return { weights: newWeights };
    });

    // Update top events after weight change
    updateTopEvents();
  },

  setPreferenceText: (category, value) => {
    set((state) => ({
      preferenceTexts: { ...state.preferenceTexts, [category]: value },
    }));

    // Update top events after preference change
    updateTopEvents();
  },

  updateTheme: () => set((state) => ({ themeUpdate: state.themeUpdate + 1 })),
}));
// Helper functions
async function updatePreferenceVectors(preferenceTexts: PreferenceTexts) {
  const vectors: Record<string, number[]> = {};
  for (const [key, text] of Object.entries(preferenceTexts)) {
    vectors[key] = await getEmbeddingForText(text);
  }
  return vectors;
}

async function updateTopEvents() {
  const store = useVectorStore.getState();
  if (!store.initialized) return;

  const vectors = await updatePreferenceVectors(store.preferenceTexts);
  const combined = weightedCombination(store.weights, vectors);
  const top = await queryEventsByVector(combined, 5);
  useVectorStore.setState({ topEvents: top });
}
