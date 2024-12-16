'use client';

import { useEffect } from 'react';
import { useVectorStore } from './vector-store';

export function InitializeStore() {
  const store = useVectorStore();

  useEffect(
    function initializeVectorStore() {
      if (!store.initialized && !store.loading) {
        store.initialize();
      }
    },
    [store.initialized, store.loading, store.initialize],
  );

  if (store.error) {
    return <div className="text-red-500">{store.error}</div>;
  }

  if (store.loading) {
    return <div>Loading demo...</div>;
  }

  return null;
}
