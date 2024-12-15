import { type RxCollection, type RxDatabase, createRxDatabase } from 'rxdb';
import { getRxStorageMemory } from 'rxdb/plugins/storage-memory';
import { cosineSimilarity } from './vector-utils';

const schema = {
  title: 'event schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    description: { type: 'string' },
    vector: {
      type: 'array',
      items: { type: 'number' },
    },
  },
  required: ['id', 'name', 'vector'],
};

let db: RxDatabase;
let eventsCollection: RxCollection;

export async function initDB() {
  if (!db) {
    db = await createRxDatabase({
      name: 'eventsdb',
      storage: getRxStorageMemory(),
    });

    const collections = await db.addCollections({
      events: {
        schema,
      },
    });

    eventsCollection = collections.events;
  }
  return eventsCollection;
}

export async function seedEvents(
  eventData: Array<{
    id: string;
    name: string;
    description: string;
    vector: number[];
  }>,
) {
  const col = await initDB();

  await col.bulkInsert(eventData);
}

export async function queryEventsByVector(queryVector: number[], limit = 5) {
  const col = await initDB();

  const docs = await col.find().exec();

  const scored = docs.map((doc) => {
    const data = doc.toJSON();

    const score = cosineSimilarity(queryVector, data.vector);

    return { ...data, score };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
