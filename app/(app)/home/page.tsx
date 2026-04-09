'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useApp } from '@/lib/app-context';
import { CATEGORIES } from '@/data/donations';
import { DonationItem } from '@/types';
import { MK_CITIES } from '@/data/donations';
import {
  DonationCard, DonationCardSkeleton, EmptyState,
  SearchIcon, FilterCityDropdown, DateFilterDropdown,
  HeartIcon, CategoryIcon,
} from '@/app/components/shared';

function FeedContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get('cat') || 'Сите';
  const {
    donations, donationsLoading,
    isLoggedIn, userId, interestedIds, pendingInterestIds,
    handleInterest, setSelected, setModal, setAuthDefaultTab, setInterestedItem,
  } = useApp();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = donations.filter(d => {
    const matchCat = catParam === 'Сите' || d.category === catParam;
    const matchQ = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchCity = !cityFilter || d.location === cityFilter;
    let matchDate = true;
    if (dateFilter && d.createdAtISO) {
      const now = new Date();
      const created = new Date(d.createdAtISO);
      if (dateFilter === 'today') matchDate = created.toDateString() === now.toDateString();
      else if (dateFilter === 'week') matchDate = created >= new Date(now.getTime() - 7 * 864e5);
      else if (dateFilter === 'month') { const m = new Date(now); m.setMonth(now.getMonth() - 1); matchDate = created >= m; }
      else if (dateFilter === 'year') matchDate = created.getFullYear() === now.getFullYear();
    }
    return matchCat && matchQ && matchCity && matchDate;
  });

  return (
    <div className="home-page-padding" style={{ padding: '32px 32px' }}>
      <div className="home-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 40, fontWeight: 700, color: '#0f52a1', lineHeight: 1.1, fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive" }}>
            {catParam === 'Сите' ? 'Сите донации' : catParam}
          </h1>
          <div style={{ fontSize: 14, color: '#aaa', fontWeight: 700, marginTop: 4 }}>
            {filtered.length} предмет{filtered.length === 1 ? '' : 'и'} достапн{filtered.length === 1 ? '' : 'и'}
          </div>
        </div>
        <div className="home-filters" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="home-search-bar" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 0, padding: '0 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minWidth: 220, border: '2px solid transparent', height: 40 }}>
            <span style={{ color: '#C4B5A0', display: 'flex', alignItems: 'center' }}><SearchIcon size={16} /></span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пребарај..."
              style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, background: 'transparent', width: '100%', color: '#555', height: '100%', padding: 0, margin: 0 }} />
          </div>
          <FilterCityDropdown value={cityFilter} onChange={setCityFilter} />
          <DateFilterDropdown value={dateFilter} onChange={setDateFilter} />
        </div>
      </div>

      {donationsLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }} aria-label="Се вчитува..." aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <DonationCardSkeleton key={i} />)}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
            {filtered.map(item => (
              <DonationCard key={item.id} item={item}
                onClick={() => setSelected(item)}
                onInterest={() => isLoggedIn ? handleInterest(item.id) : (setAuthDefaultTab('login'), setModal('auth'))}
                isLoggedIn={isLoggedIn}
                isInterested={interestedIds.has(item.id)}
                interestDisabled={pendingInterestIds.has(item.id)}
                isOwn={item.userId === userId}
                onViewInterested={item.userId === userId ? () => setInterestedItem(item) : undefined}
              />
            ))}
          </div>
          {filtered.length === 0 && <EmptyState icon={<img src="/drugo.svg" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />} title="Нема резултати" sub="Обиди се со друго пребарување" />}
        </>
      )}
    </div>
  );
}

export default function FeedPage() {
  return (
    <Suspense>
      <FeedContent />
    </Suspense>
  );
}
