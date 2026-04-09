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
  userId?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  isOwn: boolean;
  time: string;
}

export type Conversation = {
  conversationId: string;
  item: DonationItem;
  msgs: ChatMessage[];
  lastMsgAt: string;
};

export type NotificationItem = {
  id: string;
  type: 'message' | 'interest';
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  conversationId?: string; // message notifications
  donationId?: string;     // interest notifications
};

export type MsgToastData = {
  senderName: string;
  content: string;
  conversationId: string;
};

export type InterestToastData = {
  title: string;
  body: string;
  donationId: string;
};
