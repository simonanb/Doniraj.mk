export type Condition = 'Одлична' | 'Добра' | 'Солидна';

export interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: Condition;
  location: string;
  donorName: string;
  donorAvatar: string;
  image?: string;
  images?: string[];
  emoji: string;
  cardColor: string;
  accentColor: string;
  createdAt: string;
  createdAtISO?: string;
  interestedCount: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isOwn: boolean;
  time: string;
}
