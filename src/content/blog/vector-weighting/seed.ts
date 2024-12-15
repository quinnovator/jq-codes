import { seedEvents } from './db';
import { getEmbeddingForText } from './embedder';

export async function seedDemoEvents() {
  const eventDescriptions = [
    {
      id: '1',
      name: 'Mountain Hike',
      description: 'A guided hike in the mountains. Outdoor and peaceful.',
    },
    {
      id: '2',
      name: 'Tech Talk: AI Innovation',
      description:
        'A conference on cutting-edge AI tech, indoors, quiet environment.',
    },
    {
      id: '3',
      name: 'Local Art Fair',
      description:
        'An exhibition of local artists and galleries. Artsy atmosphere, not crowded.',
    },
    {
      id: '4',
      name: 'Startup Hackathon',
      description:
        '24-hour coding competition and workshop. Tech-focused, can get crowded.',
    },
    {
      id: '5',
      name: 'River Kayaking',
      description: 'Outdoor water adventure, peaceful and not noisy.',
    },
    {
      id: '6',
      name: 'Modern Art Museum Tour',
      description: 'A tour of modern art installations. Artsy, indoors, quiet.',
    },
    {
      id: '7',
      name: 'Noisy Night Club',
      description:
        'A loud and crowded nightlife experience with music and dancing.',
    },
    {
      id: '8',
      name: 'Crowded City Market',
      description: 'A bustling, crowded market full of vendors and people.',
    },
    {
      id: '9',
      name: 'Outdoor Sculpture Park',
      description:
        'An outdoor park with various sculptures. Artsy and peaceful.',
    },
    {
      id: '10',
      name: 'Tech Expo',
      description: 'A large tech expo, can be crowded but highly tech-focused.',
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
