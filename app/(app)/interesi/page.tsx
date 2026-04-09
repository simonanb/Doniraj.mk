'use client';

import { useApp } from '@/lib/app-context';
import { DonationCard, EmptyState, HeartIcon } from '@/app/components/shared';

export default function InteresiPage() {
  const { donations, interestedIds, pendingInterestIds, isLoggedIn, userId, handleInterest, setSelected, setModal, setAuthDefaultTab } = useApp();
  const interestedItems = donations.filter(d => interestedIds.has(d.id));

  return (
    <div className="page-padding">
      <h1 style={{ margin: '0 0 20px', fontSize: 40, fontWeight: 700, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive", display: 'flex', alignItems: 'center', gap: 8 }}>
        <HeartIcon size={24} /> Мои интереси
      </h1>

      {interestedItems.length === 0 ? (
        <EmptyState icon={<img src="/besplatno.svg" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />} title="Сè уште нема интереси" sub="Кликни 'Интерес' на некој предмет за да го зачуваш овде" />
      ) : (
        <div className="donation-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {interestedItems.map(item => (
            <DonationCard key={item.id} item={item}
              onClick={() => setSelected(item)}
              onInterest={() => isLoggedIn ? handleInterest(item.id) : (setAuthDefaultTab('login'), setModal('auth'))}
              isLoggedIn={isLoggedIn}
              isInterested={true}
              interestDisabled={pendingInterestIds.has(item.id)}
              isOwn={item.userId === userId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
