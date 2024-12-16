'use client';

import { create } from 'zustand';
import { initDB } from './db';
import { getEmbeddingForText } from './embedder';
import { seedDemoEvents } from './seed';

export type DemoEvent = {
  id: string;
  name: string;
  description: string;
  vector: number[];
  score: number;
};

export type PreferenceVectors = {
  outdoors: number[];
  artsy: number[];
  techFocused: number[];
  noisy: number[];
  crowded: number[];
};

export type VectorStore = {
  events: DemoEvent[];
  preferenceVectors: PreferenceVectors | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  initialize: () => Promise<void>;
};

export const useVectorStore = create<VectorStore>((set, get) => ({
  events: [],
  preferenceVectors: null,
  loading: false,
  initialized: false,
  error: null,

  initialize: async () => {
    const state = get();
    if (state.initialized) return;

    try {
      set({ loading: true, error: null });

      await seedDemoEvents();

      const collection = await initDB();
      const docs = await collection.find().exec();
      const events = docs.map((doc) => doc.toJSON());

      // Initialize preference vectors
      const preferenceVectors = {
        outdoors: await getEmbeddingForText(
          'outdoor nature hiking trails park',
        ),
        artsy: await getEmbeddingForText(
          'art museum gallery creative artistic',
        ),
        techFocused: await getEmbeddingForText(
          'technology innovation tech startup digital',
        ),
        noisy: await getEmbeddingForText(
          'loud noisy bustling sound music not-family-friendly',
        ),
        crowded: await getEmbeddingForText(
          'crowded busy packed full people not-family-friendly',
        ),
      };

      if (events.length === 0) {
        throw new Error('No events found after initialization');
      }

      set({
        events,
        preferenceVectors,
        initialized: true,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      set({
        loading: false,
        initialized: true,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to initialize vector store',
      });
    }
  },
}));
