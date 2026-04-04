import { DonationItem } from '@/types';

export const formatDate = (iso?: string, fallback?: string): string => {
  if (!iso) {
    if (!fallback || fallback === 'само сега') return 'Денес';
    return fallback;
  }
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Денес ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Вчера ${time}`;
  return d.toLocaleDateString('mk-MK');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapDonation = (row: any): DonationItem => ({
  id: row.id,
  title: row.title,
  description: row.description,
  category: row.category,
  condition: row.condition as DonationItem['condition'],
  location: row.location,
  donorName: row.donor_name,
  donorAvatar: row.donor_avatar,
  image: row.image ?? undefined,
  images: row.images ?? undefined,
  emoji: row.emoji,
  cardColor: row.card_color,
  accentColor: row.accent_color,
  createdAt: formatDate(row.created_at_iso),
  createdAtISO: row.created_at_iso,
  interestedCount: row.interested_count ?? 0,
  userId: row.user_id,
});
