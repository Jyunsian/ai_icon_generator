import type { ExploreItem } from '../types';

export const APP_VERSION = '1.2';

export const ALL_PROMPT_SUGGESTIONS = [
  'A futuristic cyber-security app icon with neon glow and metallic textures.',
  'A minimal leaf-inspired icon for a sustainable vertical farming tool.',
  'A high-contrast 3D golden trophy icon for a competitive sports betting app.',
  'A glassmorphism heart icon for a social wellness platform with pastel gradients.',
  'A neo-brutalistic geometric shape for a modern architectural design firm.',
  'A cinematic camera lens icon for a premium 4K video editing suite.',
  'A flat, colorful geometric bird for a high-speed messaging startup.',
  'A textured clay-style piggy bank for a Gen-Z personal finance saving app.',
  'A sleek, brushed aluminum gear icon for an industrial automation dashboard.',
  'A mystical floating crystal for a fantasy RPG game icon.',
  'A cozy steaming coffee cup with a hand-drawn feel for a cafe finder.',
  'An abstract infinite loop icon for a productivity and time-loop app.',
] as const;

export const MOCK_EXPLORE: ExploreItem[] = [
  {
    id: '1',
    title: 'Zen Meditation',
    category: 'Health',
    style: 'Glassmorphism',
    imageUrl:
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=1000&auto=format&fit=crop',
    author: 'Alex R.',
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Crypto Vault',
    category: 'Finance',
    style: 'Neo-Brutalism',
    imageUrl:
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000&auto=format&fit=crop',
    author: 'Sarah K.',
    isFeatured: false,
  },
  {
    id: '3',
    title: 'Status Saver Pro',
    category: 'Utility',
    style: 'Cinematic',
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    author: 'Architect AI',
    isFeatured: true,
  },
  {
    id: '4',
    title: 'Pixel Runner',
    category: 'Gaming',
    style: 'Pixel Art',
    imageUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    author: 'GameDev99',
    isFeatured: false,
  },
  {
    id: '5',
    title: 'Eco Tracker',
    category: 'Utility',
    style: 'Minimalist',
    imageUrl:
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
    author: 'GreenTech',
    isFeatured: true,
  },
  {
    id: '6',
    title: 'Chef Palette',
    category: 'Food',
    style: 'Hyper-Realistic',
    imageUrl:
      'https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop',
    author: 'FoodieLabs',
    isFeatured: false,
  },
  {
    id: '7',
    title: 'Weather Sphere',
    category: 'Utility',
    style: '3D Isomorphic',
    imageUrl:
      'https://images.unsplash.com/photo-1504370805625-d32c54b16100?q=80&w=1000&auto=format&fit=crop',
    author: 'AeroUI',
    isFeatured: false,
  },
  {
    id: '8',
    title: 'Nebula Navigator',
    category: 'Education',
    style: 'Futuristic',
    imageUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop',
    author: 'StellarAI',
    isFeatured: true,
  },
];

export const STORAGE_KEY = 'architect-ai-state';
