import { Drama, Ghost, Heart, Sparkles, Users } from 'lucide-react';
import type { TeamSize } from '../../types/partner';
import type { SettingsChoiceOption } from './components/SettingsChoiceGroup';

export const SETTINGS_GENRE_OPTIONS: SettingsChoiceOption<string>[] = [
  {
    value: 'fantasy',
    label: 'Fantasy',
    description: 'Epic worlds and magic',
    icon: Sparkles,
  },
  {
    value: 'drama',
    label: 'Drama',
    description: 'Character-driven stories',
    icon: Drama,
  },
  {
    value: 'romance',
    label: 'Romance',
    description: 'Love and relationships',
    icon: Heart,
  },
  {
    value: 'horror',
    label: 'Horror',
    description: 'Suspense and thrills',
    icon: Ghost,
  },
];

export const SETTINGS_TEAM_SIZE_OPTIONS: SettingsChoiceOption<TeamSize>[] = [
  {
    value: '1-10',
    label: '1–10',
    description: 'Small team',
    icon: Users,
  },
  {
    value: '11-50',
    label: '11–50',
    description: 'Growing team',
    icon: Users,
  },
  {
    value: '51-200',
    label: '51–200',
    description: 'Mid-size org',
    icon: Users,
  },
  {
    value: '200+',
    label: '200+',
    description: 'Large org',
    icon: Users,
  },
];
