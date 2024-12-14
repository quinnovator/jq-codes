import { seedEvents } from './db';
import { getEmbeddingForText } from './embedder';

export async function seedDemoEvents() {
  const eventDescriptions = [
    {
      id: '1',
      name: 'Mountain Hike',
      description: 'A guided hike in the mountains.',
    },
    {
      id: '2',
      name: 'Tech Talk: AI Innovation',
      description: 'A conference on cutting-edge AI tech.',
    },
    {
      id: '3',
      name: 'Local Art Fair',
      description: 'An exhibition of local artists and galleries.',
    },
    {
      id: '4',
      name: 'Startup Hackathon',
      description: '24-hour coding competition and workshop.',
    },
    {
      id: '5',
      name: 'River Kayaking',
      description: 'Outdoor water adventure.',
    },
    {
      id: '6',
      name: 'Modern Art Museum Tour',
      description: 'A tour of modern art installations.',
    },
  ];

  const eventData: {
    id: string;
    name: string;
    description: string;
    vector: number[];
  }[] = [];

  for (const evt of eventDescriptions) {
    const vec = await getEmbeddingForText(evt.description);

    eventData.push({ ...evt, vector: vec });
  }

  await seedEvents(eventData);
}
