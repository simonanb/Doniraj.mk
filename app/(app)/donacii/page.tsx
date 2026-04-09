'use client';

import { useState } from 'react';
import { useApp } from '@/lib/app-context';
import { DonationCard, EmptyState, GiftIcon, EditDonationModal, ConfirmDialog } from '@/app/components/shared';
import { DonationItem } from '@/types';

export default function DonaciiPage() {
  const { donations, isLoggedIn, userId, setSelected, handleDelete, handleEditSave, editItem, setEditItem, setInterestedItem } = useApp();
  const myDonations = donations.filter(d => d.userId === userId);
  const [confirmItem, setConfirmItem] = useState<DonationItem | null>(null);

  return (
    <div className="page-padding">
      <h1 style={{ margin: '0 0 20px', fontSize: 40, fontWeight: 700, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive", display: 'flex', alignItems: 'center', gap: 8 }}>
        <GiftIcon size={24} /> Мои донации
      </h1>

      {myDonations.length === 0 ? (
        <EmptyState icon={<img src="/drugo.svg" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />} title="Сè уште немаш донации" sub="Додај прв предмет и помогни некому!" />
      ) : (
        <div className="donation-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))', gap: 20 }}>
          {myDonations.map(item => (
            <div key={item.id} style={{ position: 'relative' }}>
              <DonationCard item={item}
                onClick={() => setSelected(item)}
                onInterest={() => {}}
                isLoggedIn={false}
                isInterested={false}
                isOwn={true}
                onViewInterested={() => setInterestedItem(item)}
              />
              <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                <button onClick={e => { e.stopPropagation(); setEditItem(item); }} title="Уреди"
                  style={{ width: 34, height: 34, background: 'white', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fe613e' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button onClick={e => { e.stopPropagation(); setConfirmItem(item); }} title="Избриши"
                  style={{ width: 34, height: 34, background: 'white', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E74C3C' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editItem && <EditDonationModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEditSave} />}
      {confirmItem && (
        <ConfirmDialog
          title="Избриши донација"
          message="Донацијата ќе биде трајно избришана. Оваа акција не може да се поништи."
          onConfirm={() => { handleDelete(confirmItem.id); setConfirmItem(null); }}
          onCancel={() => setConfirmItem(null)}
        />
      )}
    </div>
  );
}
