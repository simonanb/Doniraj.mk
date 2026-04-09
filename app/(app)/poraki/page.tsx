'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useApp } from '@/lib/app-context';
import { supabase } from '@/lib/supabase';
import { EmptyState, ChatBubbleIcon, ConfirmDialog } from '@/app/components/shared';

export default function PorakiPage() {
  const router = useRouter();
  const { conversations, isLoggedIn, userId, loadConversations, loadUnreadCount, setModal } = useApp();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <div className="page-padding">
        <h1 style={{ margin: '0 0 20px', fontSize: 40, fontWeight: 700, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive", display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChatBubbleIcon size={24} /> Пораки
        </h1>
        <EmptyState icon={<img src="/registriraj%20se.svg" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />} title="Најави се за да ги видиш пораките" sub="Треба да имаш акаунт за да испраќаш пораки" />
        <div style={{ textAlign: 'center', marginTop: -40 }}>
          <button onClick={() => setModal('auth')} style={{ background: '#fe613e', color: 'white', border: 'none', borderRadius: 50, padding: '14px 32px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
            Најави се
          </button>
        </div>
      </div>
    );
  }

  const sorted = Object.values(conversations).sort((a, b) => new Date(b.lastMsgAt).getTime() - new Date(a.lastMsgAt).getTime());

  return (
    <div className="page-padding">
      <h1 style={{ margin: '0 0 20px', fontSize: 40, fontWeight: 700, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive", display: 'flex', alignItems: 'center', gap: 8 }}>
        <ChatBubbleIcon size={24} /> Пораки
      </h1>

      {sorted.length === 0 ? (
        <EmptyState icon={<img src="/chat.svg" alt="" style={{ width: 80, height: 80, objectFit: 'contain' }} />} title="Немаш активни разговори" sub={'Отвори некој предмет и кликни „Контактирај"'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
          {sorted.map(({ conversationId: convId, item, msgs }) => {
            const last = msgs[msgs.length - 1];
            const isOwner = item.userId === userId;
            const otherName = isOwner
              ? (msgs.find(m => !m.isOwn)?.sender ?? 'Корисник')
              : item.donorName;
            const lastPrefix = last
              ? last.isOwn
                ? 'Јас: '
                : `${last.sender.split(' ')[0]}: `
              : '';
            return (
              <div key={convId}
                onClick={() => router.push(`/poraki/${convId}`)}
                role="button" tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/poraki/${convId}`); }}
                style={{ background: 'white', borderRadius: 20, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: item.cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {item.image
                    ? <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized={item.image.startsWith('data:')} />
                    : item.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: '#0f52a1' }}>{otherName}</span>
                    {last && <span style={{ fontSize: 12, color: '#bbb', fontWeight: 700 }}>{last.time}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#aaa', fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                  {last && (
                    <div style={{ fontSize: 13, color: '#777', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lastPrefix}{last.text}
                    </div>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setConfirmDeleteId(convId); }}
                  aria-label="Избриши разговор"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ddd', padding: '4px', flexShrink: 0, borderRadius: 8, transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
      {confirmDeleteId && (
        <ConfirmDialog
          title="Избриши разговор"
          message="Разговорот ќе биде трајно избришан заедно со сите пораки. Оваа акција не може да се поништи."
          onConfirm={async () => {
            const { error } = await supabase.from('conversations').delete().eq('id', confirmDeleteId);
            if (error) { console.error('[delete]', error.message); }
            else if (userId) { await loadConversations(userId); loadUnreadCount(userId); }
            setConfirmDeleteId(null);
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  );
}
