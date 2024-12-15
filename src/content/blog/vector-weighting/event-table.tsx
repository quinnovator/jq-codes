'use client';

import { useEffect, useState } from 'react';
import { useVectorStore } from './vector-store';

export function EventTable() {
  const store = useVectorStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!store.initialized && !store.loading) {
      store.initialize().catch((err) => {
        console.error('Failed to initialize events:', err);
        setError('Failed to load events. Please try refreshing the page.');
      });
    }
  }, [store.initialized, store.loading, store.initialize]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (store.loading) {
    return <div>Loading events...</div>;
  }

  if (store.events.length === 0) {
    return <div>No events found. Please try refreshing the page.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="border p-2 text-left">Event</th>
            <th className="border p-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody>
          {store.events.map((event) => (
            <tr key={event.id} className="border-b">
              <td className="border p-2">{event.name}</td>
              <td className="border p-2">{event.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
