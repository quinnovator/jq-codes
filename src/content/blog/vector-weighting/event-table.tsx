'use client';

import { useEffect, useState } from 'react';
import { initDB } from './db';
import { seedDemoEvents } from './seed';

type Event = {
  id: string;
  name: string;
  description: string;
  vector: number[];
};

export function EventTable() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(function initializeEvents() {
    async function loadEvents() {
      await seedDemoEvents();
      const collection = await initDB();
      const docs = await collection.find().exec();
      setEvents(docs.map((doc) => doc.toJSON()));
    }

    loadEvents();
  }, []);

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
          {events.map((event) => (
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
