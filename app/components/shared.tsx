'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DonationItem, MsgToastData, InterestToastData, NotificationItem } from '@/types';
import { CATEGORIES, POST_CATEGORIES, CATEGORY_COLORS, MK_CITIES } from '@/data/donations';
import { formatDate } from '@/lib/utils';
import InterestButton from './InterestButton';
import ChatScreen from './ChatScreen';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Сега';
  if (mins < 60) return `${mins}мин`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}ч`;
  return `${Math.floor(hrs / 24)}д`;
}

// ─── ICONS ───────────────────────────────────────────────────────────────────
export function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export function HeartIcon({ filled = false, size = 15 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

export function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  );
}

export function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export function PersonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

export function PinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

export function CalendarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

export function LogoutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

export function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

export function GiftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
    </svg>
  );
}

export function ChatBubbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

export function BellIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}

export function CategoryIcon({ id, size = 18 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  const img = (src: string) => <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain' }} />;
  switch (id) {
    case 'Сите':    return img('/home.svg');
    case 'Облека':  return img('/alista.svg');
    case 'Книги':   return img('/knigi.svg');
    case 'Играчки': return img('/igracki.svg');
    case 'Мебел':   return img('/mebel.svg');
    case 'Кујна':   return img('/kujnski%20aprati.svg');
    case 'Електро': return img('/elektronika.svg');
    default:        return img('/drugo.svg');
  }
}

// ─── CONDITION BADGE ─────────────────────────────────────────────────────────
export function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { bg: string; color: string; icon: string }> = {
    'Одлична': { bg: '#E8F8F5', color: '#1ABC9C', icon: '★' },
    'Добра':   { bg: '#EBF5FB', color: '#2E86C1', icon: '✓' },
    'Солидна': { bg: '#FEF9E7', color: '#E67E22', icon: '◎' },
  };
  const s = map[condition] || { bg: '#f0f0f0', color: '#888', icon: '•' };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 50, padding: '5px 12px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span aria-hidden="true">{s.icon}</span>
      <span>Состојба: {condition}</span>
    </span>
  );
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
export function DonationCardSkeleton() {
  const pulse: React.CSSProperties = { background: '#EDE5D8', animation: 'shimmer 1.6s ease-in-out infinite', borderRadius: 8 };
  return (
    <div style={{ background: 'white', borderRadius: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
      <div style={{ ...pulse, height: 160, borderRadius: 0 }} />
      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ ...pulse, height: 13, width: '55%' }} />
        <div style={{ ...pulse, height: 18, width: '80%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...pulse, height: 26, width: '45%', borderRadius: 50 }} />
          <div style={{ ...pulse, height: 26, width: '30%', borderRadius: 50 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 4 }}>
          <div style={{ ...pulse, height: 30, width: '38%', borderRadius: 50 }} />
          <div style={{ ...pulse, height: 30, width: '42%', borderRadius: 50 }} />
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', color: '#C4B5A0' }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#555' }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function InterestedModal({ item, onClose }: { item: DonationItem; onClose: () => void }) {
  const router = useRouter();
  const [users, setUsers] = useState<{ userId: string; userName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [contactingId, setContactingId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    supabase.rpc('get_interested_users', { p_donation_id: item.id })
      .then(({ data }) => {
        setUsers((data || []).map((r: any) => ({ userId: r.user_id, userName: r.user_name || 'Корисник' })));
        setLoading(false);
      });
  }, [item.id]);

  const handleContact = async (interestedUserId: string) => {
    setContactingId(interestedUserId);
    try {
      const { data: existing } = await supabase.from('conversations').select('id')
        .eq('donation_id', item.id).eq('participant_id', interestedUserId).maybeSingle();
      let convId = existing?.id;
      if (!convId) {
        const { data: created } = await supabase.from('conversations')
          .insert({ donation_id: item.id, participant_id: interestedUserId })
          .select('id').single();
        convId = created?.id;
      }
      if (convId) { onClose(); router.push(`/poraki/${convId}`); }
    } finally { setContactingId(null); }
  };

  return (
    <div onClick={onClose} aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div role="dialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 0, width: 'min(440px, 100%)', maxHeight: '80vh', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'scaleIn 0.22s ease', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #F0EBE0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, color: '#0f52a1' }}>Заинтересирани</div>
            <div style={{ fontSize: 13, color: '#aaa', fontWeight: 700, marginTop: 2 }}>{item.title}</div>
          </div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 22, lineHeight: 1, padding: '2px 6px' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px 16px' }}>
          {loading ? (
            [0, 1, 2].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 8px', borderBottom: '1px solid #F5F5F5' }}>
                <div style={{ width: 44, height: 44, borderRadius: 0, background: '#EDE5D8', animation: 'shimmer 1.4s ease infinite', flexShrink: 0 }} />
                <div style={{ flex: 1, height: 14, borderRadius: 6, background: '#EDE5D8', animation: 'shimmer 1.4s ease infinite' }} />
              </div>
            ))
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#bbb', fontWeight: 700, fontSize: 14 }}>Сè уште нема заинтересирани</div>
          ) : (
            users.map((u, i) => (
              <div key={u.userId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 8px', borderBottom: i < users.length - 1 ? '1px solid #F5F5F5' : 'none' }}>
                <div style={{ width: 44, height: 44, borderRadius: 0, background: '#fe613e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                  {u.userName.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontWeight: 800, fontSize: 15, color: '#0f52a1' }}>{u.userName}</span>
                <button onClick={() => handleContact(u.userId)} disabled={!!contactingId}
                  style={{ background: '#0f52a1', color: 'white', border: 'none', borderRadius: 0, padding: '10px 18px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', cursor: contactingId ? 'default' : 'pointer', opacity: contactingId === u.userId ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, transition: 'opacity 0.15s' }}>
                  <ChatBubbleIcon size={13} />
                  {contactingId === u.userId ? 'Момент...' : 'Порака'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Да, избриши', cancelLabel = 'Откажи', onConfirm, onCancel, loading = false }: {
  title: string; message: string;
  confirmLabel?: string; cancelLabel?: string;
  onConfirm: () => void; onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div role="alertdialog" aria-modal="true" onClick={e => e.stopPropagation()} style={{ background: 'white', borderRadius: 0, padding: '32px 28px', width: 'min(380px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'scaleIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
        </div>
        <div style={{ fontSize: 30, fontWeight: 900, color: '#0f52a1', textAlign: 'center', marginBottom: 10, fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive" }}>{title}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#888', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>{message}</div>
        <div className="modal-buttons" style={{ display: 'flex', gap: 10 }}>
          <button onClick={onCancel} disabled={loading} style={{ flex: 1, background: 'transparent', border: '2px solid #e1b3ec', borderRadius: 0, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#0f52a1', textTransform: 'uppercase' }}>{cancelLabel}</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex: 1, background: '#E74C3C', border: 'none', borderRadius: 0, padding: '14px', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', cursor: loading ? 'default' : 'pointer', color: 'white', opacity: loading ? 0.7 : 1 }}>{loading ? 'Момент...' : confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div role="status" aria-live="polite" aria-atomic="true" style={{
      position: 'fixed', bottom: 36, left: '50%',
      animation: 'slideUpFade 0.3s ease forwards',
      background: '#0f52a1', color: 'white', padding: '14px 28px',
      borderRadius: 0, fontSize: 15, fontWeight: 800, zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}

export function InterestToast({ data, onClose, onClick }: { data: InterestToastData; onClose: () => void; onClick: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const preview = data.body.length > 50 ? data.body.slice(0, 50) + '…' : data.body;
  return (
    <div role="status" aria-live="polite" aria-atomic="true" onClick={onClick} style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 9999,
      maxWidth: 320, width: 'calc(100vw - 48px)',
      background: 'white', borderLeft: '4px solid #e1b3ec', borderRadius: 0,
      padding: '14px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      cursor: 'pointer', animation: 'slideInRight 0.28s ease',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFF0F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
        ❤️
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f52a1', marginBottom: 2 }}>{data.title}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
    </div>
  );
}

export function MessageToast({ data, onClose, onClick }: { data: MsgToastData; onClose: () => void; onClick: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);
  const preview = data.content.length > 40 ? data.content.slice(0, 40) + '…' : data.content;
  return (
    <div role="status" aria-live="polite" aria-atomic="true" onClick={onClick} style={{
      position: 'fixed', bottom: 28, right: 24, zIndex: 9999,
      maxWidth: 320, width: 'calc(100vw - 48px)',
      background: 'white', borderLeft: '4px solid #fe613e', borderRadius: 0,
      padding: '14px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
      cursor: 'pointer', animation: 'slideInRight 0.28s ease',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#fe613e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
        {data.senderName.slice(0, 2).toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#0f52a1', marginBottom: 2 }}>Нова порака од {data.senderName}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{preview}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 18, lineHeight: 1, padding: '0 2px', flexShrink: 0 }}>×</button>
    </div>
  );
}

export function NotifPrompt({ onAllow, onLater }: { onAllow: () => void; onLater: () => void }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: 'white', borderRadius: 0, padding: '16px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', maxWidth: 360, width: 'calc(100vw - 48px)', display: 'flex', flexDirection: 'column', gap: 12, animation: 'slideUpFade 0.3s ease forwards' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 22 }}>🔔</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 900, color: '#0f52a1', marginBottom: 2 }}>Дозволи нотификации</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#888' }}>Ќе те известиме за нови пораки</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onAllow} style={{ flex: 1, background: '#fe613e', color: 'white', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Дозволи</button>
        <button onClick={onLater} style={{ flex: 1, background: '#F5F0EB', color: '#888', border: 'none', borderRadius: 0, padding: '10px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer' }}>Подоцна</button>
      </div>
    </div>
  );
}

// ─── DONATION CARD ────────────────────────────────────────────────────────────
export function DonationCard({ item, onClick, onInterest, isLoggedIn, isInterested, interestDisabled = false, isOwn = false, onViewInterested }: {
  item: DonationItem; onClick: () => void; onInterest: () => void;
  isLoggedIn: boolean; isInterested: boolean; interestDisabled?: boolean; isOwn?: boolean;
  onViewInterested?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div role="button" tabIndex={0}
      aria-label={`${item.title} — ${item.condition} — ${item.location}`}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } if (e.key === 'l' || e.key === 'L') { e.preventDefault(); if (isLoggedIn && !interestDisabled) onInterest(); } }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: 'white', borderRadius: 0, overflow: 'hidden', cursor: 'pointer', boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.13)' : '0 4px 20px rgba(0,0,0,0.07)', transform: hovered ? 'translateY(-4px)' : 'translateY(0)', transition: 'all 0.2s ease' }}
    >
      <div style={{ background: item.cardColor, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', fontSize: 76, overflow: 'hidden' }}>
        {item.image
          ? <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized={item.image.startsWith('data:')} />
          : <span aria-hidden="true">{item.emoji}</span>}
        {item.interestedCount > 0 && (
          <div
            onClick={isOwn && onViewInterested ? e => { e.stopPropagation(); onViewInterested(); } : undefined}
            title={isOwn ? 'Погледај кој е заинтересиран' : undefined}
            style={{ position: 'absolute', top: 12, right: 12, background: 'white', borderRadius: 50, padding: '4px 12px', fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', cursor: isOwn && onViewInterested ? 'pointer' : 'default' }}>
            <span style={{ color: '#E74C3C' }}><HeartIcon /></span>
            <span>{item.interestedCount}</span>
          </div>
        )}
      </div>
      <div style={{ padding: '22px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <PersonIcon /> {item.donorName}
        </div>
        <div title={item.title} style={{ fontWeight: 900, fontSize: 17, marginBottom: 14, color: '#0f52a1', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
          <ConditionBadge condition={item.condition} />
          {(item.createdAtISO || item.createdAt) && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarIcon /> {formatDate(item.createdAtISO, item.createdAt)}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ background: '#F5F5F5', borderRadius: 50, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#888', display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
            <PinIcon /> {item.location}
          </span>
          {!isOwn && <InterestButton isLiked={isInterested} onToggle={onInterest} size="sm" disabled={interestDisabled} />}
        </div>
      </div>
    </div>
  );
}

// ─── FILTER DROPDOWNS ────────────────────────────────────────────────────────
export function CityDropdown({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: `2px solid ${error ? '#E74C3C' : open ? '#fe613e' : '#EDE5D8'}`, borderRadius: 0, padding: '14px 18px', fontSize: 15, fontWeight: 700, background: 'white', cursor: 'pointer', transition: 'border-color 0.2s', color: value ? '#0f52a1' : '#aaa' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PinIcon size={15} /><span>{value || 'Избери општина *'}</span></span>
        <span style={{ fontSize: 12, color: '#aaa' }}>▾</span>
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 600, background: 'white', borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', maxHeight: 240, overflowY: 'auto', padding: '8px 0' }}>
          {MK_CITIES.map(c => (
            <div key={c} onClick={() => { onChange(c); setOpen(false); }} style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700, color: value === c ? '#fe613e' : '#0f52a1', background: value === c ? '#FFF0EC' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { if (value !== c) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === c ? '#FFF0EC' : 'transparent'; }}>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function FilterCityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} className="filter-trigger" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 0, padding: '0 20px', height: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: value ? '2px solid #fe613e' : '2px solid transparent', transition: 'border-color 0.2s', cursor: 'pointer', userSelect: 'none', color: value ? '#fe613e' : '#AAA' }}>
        <PinIcon size={16} />
        <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>{value || 'Сите општини'}</span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#fe613e', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
          : <span style={{ color: '#AAA', fontSize: 18, marginLeft: 2 }}>▾</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 600, background: 'white', borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', maxHeight: 280, overflowY: 'auto', minWidth: 200, padding: '8px 0' }}>
          {['', ...MK_CITIES].map(c => (
            <div key={c || '__all__'} onClick={() => { onChange(c); setOpen(false); }} style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700, color: value === c ? '#fe613e' : '#0f52a1', background: value === c ? '#FFF0EC' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { if (value !== c) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === c ? '#FFF0EC' : 'transparent'; }}>
              {c || 'Сите општини'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = [{ id: '', label: 'Сите датуми' }, { id: 'today', label: 'Денес' }, { id: 'week', label: 'Оваа недела' }, { id: 'month', label: 'Овој месец' }, { id: 'year', label: 'Оваа година' }];
  const selected = options.find(o => o.id === value) || options[0];
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div onClick={() => setOpen(o => !o)} className="filter-trigger" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'white', borderRadius: 0, padding: '0 20px', height: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: value ? '2px solid #fe613e' : '2px solid transparent', transition: 'border-color 0.2s', cursor: 'pointer', userSelect: 'none', color: value ? '#fe613e' : '#AAA' }}>
        <CalendarIcon size={16} />
        <span style={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>{selected.label}</span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#fe613e', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
          : <span style={{ color: '#AAA', fontSize: 18, marginLeft: 2 }}>▾</span>}
      </div>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 600, background: 'white', borderRadius: 0, boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 180, padding: '8px 0' }}>
          {options.map(o => (
            <div key={o.id || '__all__'} onClick={() => { onChange(o.id); setOpen(false); }} style={{ padding: '10px 18px', fontSize: 14, fontWeight: 700, color: value === o.id ? '#fe613e' : '#0f52a1', background: value === o.id ? '#FFF0EC' : 'transparent', cursor: 'pointer' }}
              onMouseEnter={e => { if (value !== o.id) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === o.id ? '#FFF0EC' : 'transparent'; }}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
export function DetailModal({ item, onClose, onInterest, isLoggedIn, onAuthRequired, isInterested, interestDisabled, userId, userName, onEdit, onDelete, onViewInterested }: {
  item: DonationItem; onClose: () => void; onInterest: () => void;
  isLoggedIn: boolean; onAuthRequired: () => void;
  isInterested: boolean; interestDisabled?: boolean;
  userId: string | null; userName: string;
  onEdit?: (item: DonationItem) => void;
  onDelete?: (itemId: string) => void;
  onViewInterested?: (item: DonationItem) => void;
}) {
  const isOwn = !!userId && item.userId === userId;
  const [screen, setScreen] = useState<'detail' | 'chat'>('detail');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [guestSheet, setGuestSheet] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [contactLoading, setContactLoading] = useState(false);
  const [extraImages, setExtraImages] = useState<string[] | undefined>(item.images);
  const allImages = extraImages && extraImages.length > 0 ? extraImages : item.image ? [item.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const guestInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (item.images !== undefined) return;
    supabase.from('donations').select('images').eq('id', item.id).single()
      .then(({ data }) => { if (data?.images) setExtraImages(data.images as string[]); });
  }, [item.id, item.images]);

  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (guestSheet) { setGuestSheet(false); return; } if (screen === 'chat') { setScreen('detail'); return; } onClose(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, screen, guestSheet]);

  useEffect(() => { if (guestSheet) setTimeout(() => guestInputRef.current?.focus(), 50); }, [guestSheet]);

  const handleContactClick = async () => {
    if (!isLoggedIn) { setGuestSheet(true); return; }
    setContactLoading(true);
    try {
      const { data: existing } = await supabase.from('conversations').select('id').eq('donation_id', item.id).eq('participant_id', userId!).maybeSingle();
      setConversationId(existing?.id ?? null);
      setScreen('chat');
    } finally { setContactLoading(false); }
  };

  const handleGuestSubmit = () => { if (!guestNameInput.trim()) return; setGuestSheet(false); setScreen('chat'); };

  return (
    <div onClick={onClose} aria-hidden="true" className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="detail-modal-title" onClick={e => e.stopPropagation()} style={{ borderRadius: 0, width: 'min(560px, 100%)', height: 'min(90vh, 720px)', boxShadow: '0 32px 80px rgba(0,0,0,0.25)', animation: 'scaleIn 0.22s ease', overflow: 'hidden', position: 'relative', background: 'white' }}>
        {/* Detail panel */}
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
            <div style={{ background: item.cardColor, flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, position: 'relative' }}>
                {allImages.length > 0
                  ? <Image src={allImages[activeImg]} alt={item.title} fill style={{ objectFit: 'contain' }} unoptimized={allImages[activeImg].startsWith('data:')} />
                  : item.emoji}
                {allImages.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)} aria-label="Претходна слика" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>‹</button>
                    <button onClick={() => setActiveImg(i => (i + 1) % allImages.length)} aria-label="Следна слика" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>›</button>
                  </>
                )}
              </div>
              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#FFF0F8', overflowX: 'auto' }} role="tablist" aria-label="Сликовна галерија">
                  {allImages.map((src, i) => (
                    <Image key={i} src={src} alt={`Слика ${i + 1}`} width={56} height={56} role="tab" tabIndex={0} aria-selected={activeImg === i} onClick={() => setActiveImg(i)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveImg(i); } }} unoptimized={src.startsWith('data:')} style={{ objectFit: 'contain', borderRadius: 10, flexShrink: 0, background: 'white', cursor: 'pointer', border: activeImg === i ? '2.5px solid #fe613e' : '2.5px solid transparent', opacity: activeImg === i ? 1 : 0.7, transition: 'all 0.15s' }} />
                  ))}
                </div>
              )}
              <button onClick={onClose} aria-label="Затвори" style={{ position: 'absolute', top: 14, right: 14, background: 'white', border: 'none', borderRadius: '50%', width: 38, height: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}><CloseIcon /></button>
              <div style={{ position: 'absolute', top: 14, left: 14, background: 'white', borderRadius: 50, padding: '5px 14px', fontSize: 12, fontWeight: 800, color: item.accentColor, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>{item.category}</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <h2 id="detail-modal-title" style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f52a1', lineHeight: 1.2 }}>{item.title}</h2>
                <ConditionBadge condition={item.condition} />
              </div>
              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.65, marginBottom: 20, fontWeight: 700 }}>{item.description}</p>
              <div style={{ background: '#FFF0F8', borderRadius: 0, padding: '16px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: <PersonIcon />, label: 'Донатор', value: item.donorName, key: 'donor' },
                  { icon: <PinIcon size={13} />, label: 'Локација', value: item.location, key: 'loc' },
                  { icon: <HeartIcon size={13} />, label: 'Заинтересирани', value: `${item.interestedCount} луѓе`, key: 'int' },
                  { icon: <CalendarIcon size={13} />, label: 'Постирано', value: formatDate(item.createdAtISO, item.createdAt), key: 'date' },
                ].map(r => (
                  <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: '#999', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{r.icon} {r.label}</span>
                    {r.key === 'int' && isOwn && item.interestedCount > 0 && onViewInterested ? (
                      <button onClick={() => { onViewInterested(item); onClose(); }}
                        style={{ fontSize: 13, fontWeight: 900, color: '#fe613e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {item.interestedCount} луѓе →
                      </button>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 900, color: '#0f52a1' }}>{r.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            {!isOwn && (
              <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #F0EBE0', flexShrink: 0 }}>
                <div className="modal-buttons" style={{ display: 'flex', gap: 12 }}>
                  <button onClick={handleContactClick} disabled={contactLoading} style={{ flex: 2, background: '#fe613e', color: 'white', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '16px', fontSize: 16, fontWeight: 600, cursor: contactLoading ? 'default' : 'pointer', transition: 'opacity 0.15s', opacity: contactLoading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                    onMouseEnter={e => { if (!contactLoading) e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { if (!contactLoading) e.currentTarget.style.opacity = '1'; }}>
                    <ChatBubbleIcon size={16} /> {contactLoading ? 'Момент...' : 'Контактирај'}
                  </button>
                  <button onClick={e => { e.stopPropagation(); if (!interestDisabled) onInterest(); }}
                    disabled={interestDisabled}
                    style={{ background: isInterested ? '#0f52a1' : 'transparent', color: isInterested ? 'white' : '#0f52a1', border: `2px solid ${isInterested ? '#0f52a1' : '#e1b3ec'}`, borderRadius: 0, padding: '14px 20px', fontSize: 14, fontWeight: 600, cursor: interestDisabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, textTransform: 'uppercase', opacity: interestDisabled ? 0.5 : 1, transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                    <HeartIcon size={14} filled={isInterested} /> Интерес
                  </button>
                </div>
              </div>
            )}
            {isOwn && (
              <div className="modal-buttons" style={{ padding: '16px 28px 24px', borderTop: '1px solid #F0EBE0', flexShrink: 0, display: 'flex', gap: 10 }}>
                <button onClick={() => { onEdit?.(item); onClose(); }}
                  style={{ flex: 1, background: '#fe613e', color: 'white', border: 'none', borderRadius: 0, padding: '14px', fontSize: 15, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Уреди
                </button>
                <button onClick={() => setConfirmDelete(true)}
                  style={{ flex: 1, background: '#FFF0EE', color: '#E74C3C', border: 'none', borderRadius: 0, padding: '14px', fontSize: 15, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFE0DC')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#FFF0EE')}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg> Избриши
                </button>
              </div>
            )}
        </div>
        {/* Chat panel — overlays detail panel when active */}
        {screen === 'chat' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <ChatScreen item={item} conversationId={conversationId} userId={isLoggedIn ? userId : null} userName={isLoggedIn ? userName : guestNameInput} onBack={() => setScreen('detail')} />
          </div>
        )}
        {/* Guest name sheet */}
        {guestSheet && (
          <>
            <div onClick={() => setGuestSheet(false)} aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', zIndex: 10 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: 0, padding: '28px 28px 36px', zIndex: 11, animation: 'slideUpSheet 0.25s ease' }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#0f52a1', marginBottom: 6 }}>Со кое име да те претставиме?</div>
              <div style={{ fontSize: 13, color: '#aaa', fontWeight: 700, marginBottom: 20 }}>Донаторот ќе те види под ова име</div>
              <input ref={guestInputRef} value={guestNameInput} onChange={e => setGuestNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGuestSubmit()} placeholder="Твое име или прекар" style={{ width: '100%', border: '2px solid #EDE5D8', borderRadius: 0, padding: '13px 20px', fontSize: 15, fontWeight: 700, outline: 'none', marginBottom: 12, boxSizing: 'border-box', transition: 'border-color 0.15s' }} onFocus={e => (e.currentTarget.style.borderColor = '#fe613e')} onBlur={e => (e.currentTarget.style.borderColor = '#EDE5D8')} />
              <button onClick={handleGuestSubmit} style={{ width: '100%', background: '#fe613e', color: 'white', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }} onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>Продолжи →</button>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 700, marginTop: 16 }}>
                Или{' '}
                <button onClick={() => { setGuestSheet(false); onAuthRequired(); }} style={{ background: 'none', border: 'none', color: '#fe613e', fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: 0 }}>најави се</button>
                {' '}за да ги зачуваш разговорите
              </div>
            </div>
          </>
        )}
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="Избриши донација"
          message="Донацијата ќе биде трајно избришана. Оваа акција не може да се поништи."
          onConfirm={() => { onDelete?.(item.id); onClose(); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

// ─── POST MODAL ───────────────────────────────────────────────────────────────
export function PostModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Partial<DonationItem>) => Promise<void> }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cat, setCat] = useState('');
  const [loc, setLoc] = useState('');
  const [cond, setCond] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => { const r = e.target?.result as string; if (r) setPhotos(prev => [...prev, r].slice(0, 5)); };
      reader.readAsDataURL(file);
    });
  };

  const canAdvance = () => {
    if (step === 1) return photos.length > 0;
    if (step === 2) return title.trim() !== '' && desc.trim() !== '' && cat !== '';
    if (step === 3) return loc.trim() !== '' && cond !== '';
    return true;
  };

  const tryAdvance = async () => {
    if (!canAdvance()) {
      if (step === 1) setError('Додај барем една фотографија за да продолжиш.');
      else if (step === 2) setError('Пополни ги сите полиња и избери категорија.');
      else setError('Внеси локација и избери состојба на предметот.');
      return;
    }
    setError('');
    if (step < 3) { setStep(s => s + 1); return; }
    const colors = CATEGORY_COLORS[cat] || { card: '#F5F5F5', accent: '#888' };
    const emoji = POST_CATEGORIES.find(c => c.id === cat)?.emoji || '🎁';
    setSubmitting(true);
    await onSubmit({ title, description: desc, category: cat, condition: cond as DonationItem['condition'], location: loc, emoji, cardColor: colors.card, accentColor: colors.accent, image: photos[0], images: photos });
    setSubmitting(false);
  };

  const stepTitles = ['Додај фотографии', 'Детали за предметот', 'Локација и состојба'];

  return (
    <div aria-hidden="true" className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="post-modal-title" className="modal-inner" style={{ animation: 'scaleIn 0.22s ease', background: 'white', borderRadius: 0, padding: '32px', width: 'min(560px, 100%)', zIndex: 301, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div id="post-modal-title" style={{ fontSize: 30, fontWeight: 900, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive" }}>{stepTitles[step - 1]}</div>
            <div style={{ fontSize: 14, color: '#aaa', fontWeight: 700, marginTop: 4 }}>Чекор {step} од 3</div>
          </div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>
        <div style={{ display: 'flex', gap: 8, margin: '20px 0 28px' }}>
          {[1,2,3].map(s => <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: s <= step ? '#fe613e' : '#EDE5D8', transition: 'background 0.3s' }} />)}
        </div>
        {step === 1 && (
          <>
            <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => readFiles(e.target.files)} />
            <div onClick={() => fileInputRef.current?.click()} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={e => { e.preventDefault(); setDragOver(false); readFiles(e.dataTransfer.files); }}
              style={{ border: `2px dashed ${dragOver ? '#fe613e' : error ? '#E74C3C' : '#e1b3ec'}`, borderRadius: 0, padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: dragOver ? '#FFF0EC' : '#FFF9F0', marginBottom: photos.length > 0 ? 16 : 0, cursor: 'pointer', transition: 'all 0.2s' }}>
              <img src="/camera.svg" alt="" style={{ width: 56, height: 56, objectFit: 'contain', marginBottom: 12 }} />
              <div style={{ fontWeight: 800, fontSize: 15, color: '#555', marginBottom: 6 }}>Клик или повлечи слики овде</div>
              <div style={{ fontSize: 13, color: '#bbb', fontWeight: 700 }}>PNG, JPG до 10MB · до 5 слики</div>
            </div>
            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {photos.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 0, overflow: 'hidden', background: '#eee' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} aria-label={`Отстрани слика ${i + 1}`} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}><CloseIcon /></button>
                  </div>
                ))}
                {photos.length < 5 && <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: 0, border: '2px dashed #e1b3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#0f52a1', fontWeight: 900 }}>+</div>}
              </div>
            )}
          </>
        )}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="Наслов на предметот *" style={{ border: `2px solid ${error && !title.trim() ? '#E74C3C' : '#EDE5D8'}`, borderRadius: 0, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none' }} />
            <textarea value={desc} onChange={e => { setDesc(e.target.value); setError(''); }} placeholder="Опис (состојба, бројка, возраст...) *" rows={4} style={{ border: `2px solid ${error && !desc.trim() ? '#E74C3C' : '#EDE5D8'}`, borderRadius: 0, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none', resize: 'vertical' }} />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>КАТЕГОРИЈА *</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {POST_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => { setCat(c.id); setError(''); }} style={{ background: cat === c.id ? '#0f52a1' : '#F5F5F5', color: cat === c.id ? 'white' : '#555', border: error && !cat ? '2px solid #E74C3C' : '2px solid transparent', borderRadius: 0, padding: '14px 8px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
                  <CategoryIcon id={c.id} size={28} />{c.id}
                </button>
              ))}
            </div>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <CityDropdown value={loc} onChange={v => { setLoc(v); setError(''); }} error={!!error && !loc} />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>СОСТОЈБА НА ПРЕДМЕТОТ *</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Одлична','Добра','Солидна'].map(c => (
                <button key={c} onClick={() => { setCond(c); setError(''); }} style={{ flex: 1, background: cond === c ? '#0f52a1' : '#F5F5F5', color: cond === c ? 'white' : '#555', border: error && !cond ? '2px solid #E74C3C' : '2px solid transparent', borderRadius: 0, padding: '14px 8px', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>{c}</button>
              ))}
            </div>
          </div>
        )}
        {error && <div role="alert" style={{ marginTop: 16, padding: '12px 16px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 0, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>{error}</div>}
        <div className="modal-buttons" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && <button onClick={() => { setStep(s => s - 1); setError(''); }} style={{ flex: 1, background: 'transparent', border: '2px solid #e1b3ec', borderRadius: 0, padding: '16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: '#0f52a1', textTransform: 'uppercase' }}>← Назад</button>}
          <button onClick={tryAdvance} disabled={submitting} aria-busy={submitting} style={{ flex: 2, background: '#fe613e', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '16px', fontSize: 16, fontWeight: 600, cursor: submitting ? 'default' : 'pointer', color: 'white', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1'; }}>
            {submitting ? 'Момент...' : step === 3 ? 'Објави!' : 'Следно →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
export function AuthModal({ onClose, onSubmit, onForgotPassword, defaultTab = 'login' }: {
  onClose: () => void;
  onSubmit: (d: { tab: 'login' | 'reg'; email: string; pass: string; name: string }) => Promise<string | null>;
  onForgotPassword: (email: string) => Promise<string | null>;
  defaultTab?: 'login' | 'reg';
}) {
  const [tab, setTab] = useState<'reg' | 'login'>(defaultTab);
  const [forgot, setForgot] = useState(false);
  const [regDone, setRegDone] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [supaError, setSupaError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const clearAll = () => { setPassError(''); setEmailError(''); setSupaError(''); setName(''); setEmail(''); setPass(''); setConfirmPass(''); setResetSent(false); };
  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

  const submit = async () => {
    if (!validEmail(email)) { setEmailError('Внеси валидна е-мејл адреса'); return; }
    if (tab === 'reg') {
      if (pass.length < 6) { setPassError('Лозинката мора да биде барем 6 знаци'); return; }
      if (pass !== confirmPass) { setPassError('Лозинките не се совпаѓаат'); return; }
    }
    setEmailError(''); setPassError(''); setSupaError('');
    setSubmitting(true);
    try {
      const result = await onSubmit({ tab, email, pass, name });
      if (result === '__reg_success__') { setTab('login'); setPass(''); setConfirmPass(''); setName(''); setSupaError(''); setRegDone(true); }
      else if (result) setSupaError(result);
      else onClose();
    } catch (err) { setSupaError((err as Error)?.message || 'Настана грешка. Обиди се повторно.'); }
    finally { setSubmitting(false); }
  };

  const submitForgot = async () => {
    if (!validEmail(email)) { setEmailError('Внеси валидна е-мејл адреса'); return; }
    setEmailError(''); setSupaError('');
    setSubmitting(true);
    try { const err = await onForgotPassword(email); if (err) setSupaError(err); else setResetSent(true); }
    catch { setSupaError('Настана грешка. Обиди се повторно.'); }
    finally { setSubmitting(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', border: '2px solid #EDE5D8', borderRadius: 0, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none' };

  return (
    <div aria-hidden="true" className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="auth-modal-title" onClick={e => e.stopPropagation()} className="modal-inner" style={{ animation: 'scaleIn 0.22s ease', background: 'white', borderRadius: 0, padding: '32px', width: 'min(440px, 100%)', zIndex: 301, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <div id="auth-modal-title" style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive" }}>{forgot ? 'Заборавена лозинка' : tab === 'login' ? 'Најави се' : 'Регистрирај се'}</div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>
        {forgot ? (
          resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#0f52a1', marginBottom: 8 }}>Линкот е испратен!</div>
              <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 20 }}>Провери го е-мејлот и кликни на линкот за да ја ресетираш лозинката.</div>
              <button onClick={() => { setForgot(false); clearAll(); }} style={{ background: '#0f52a1', color: 'white', border: 'none', borderRadius: 0, padding: '12px 28px', fontSize: 14, fontWeight: 600, textTransform: 'uppercase', cursor: 'pointer' }}>Назад кон најава</button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 16 }}>Внеси ја твојата е-мејл адреса и ќе ти испратиме линк за ресетирање на лозинката.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <input value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder="Е-мејл" type="email" style={{ ...inputStyle, borderColor: emailError ? '#E74C3C' : '#EDE5D8' }} />
                {emailError && <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>⚠️ {emailError}</div>}
                {supaError && <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>⚠️ {supaError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setForgot(false); clearAll(); }} style={{ flex: 1, background: 'transparent', border: '2px solid #e1b3ec', borderRadius: 0, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#0f52a1', textTransform: 'uppercase' }}>Назад</button>
                <button onClick={submitForgot} disabled={submitting} style={{ flex: 2, background: '#fe613e', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'white', opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Момент...' : 'Испрати линк'}</button>
              </div>
            </>
          )
        ) : (
          <>
            <div style={{ display: 'flex', background: '#D8D8D8', borderRadius: 0, padding: 4, marginBottom: 22 }}>
              {(['login','reg'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); clearAll(); setForgot(false); setRegDone(false); }} style={{ flex: 1, background: tab === t ? '#0f52a1' : 'transparent', color: tab === t ? 'white' : '#666', border: 'none', borderRadius: 0, padding: '10px', fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s' }}>{t === 'reg' ? 'Регистрација' : 'Најава'}</button>
              ))}
            </div>
            {regDone && tab === 'login' && <div style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 0, padding: '10px 16px', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>✅ Успешно се регистриравте! Сега најавете се.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'reg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="auth-name" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ИМЕ</label>
                  <input id="auth-name" value={name} onChange={e => setName(e.target.value)} placeholder="Вашето ime" autoComplete="name" style={inputStyle} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="auth-email" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>Е-МЕЈЛ</label>
                <input id="auth-email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder="Е-мејл" type="email" autoComplete="email" style={{ ...inputStyle, borderColor: emailError ? '#E74C3C' : '#EDE5D8' }} />
                {emailError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>{emailError}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="auth-pass" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ЛОЗИНКА</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="auth-pass" value={pass} onChange={e => { setPass(e.target.value); setPassError(''); }} placeholder="Лозинка" type={showPass ? 'text' : 'password'} autoComplete={tab === 'reg' ? 'new-password' : 'current-password'} style={{ ...inputStyle, paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Скриј лозинка' : 'Прикажи лозинка'} style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 0 }}><EyeIcon show={showPass} /></button>
                </div>
              </div>
              {tab === 'reg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="auth-confirm-pass" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ПОТВРДИ ЛОЗИНКА</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input id="auth-confirm-pass" value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setPassError(''); }} placeholder="Потврди лозинка" type={showConfirmPass ? 'text' : 'password'} autoComplete="new-password" style={{ ...inputStyle, borderColor: passError ? '#E74C3C' : '#EDE5D8', paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} aria-label={showConfirmPass ? 'Скриј лозинка' : 'Прикажи лозинка'} style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 0 }}><EyeIcon show={showConfirmPass} /></button>
                  </div>
                  {passError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>{passError}</div>}
                </div>
              )}
            </div>
            {tab === 'login' && <button onClick={() => { setForgot(true); setSupaError(''); setEmailError(''); }} style={{ background: 'none', border: 'none', padding: '8px 0 0', fontSize: 13, fontWeight: 700, color: '#fe613e', cursor: 'pointer', textAlign: 'left' }}>Забравена лозинка?</button>}
            {supaError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4, marginTop: 4 }}>{supaError}</div>}
            <button onClick={submit} disabled={submitting} style={{ width: '100%', background: '#fe613e', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '16px', fontSize: 16, fontWeight: 600, cursor: 'pointer', color: 'white', marginTop: 16, opacity: submitting ? 0.7 : 1 }}>{submitting ? 'Момент...' : (tab === 'reg' ? 'Регистрирај се' : 'Најави се')}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── EDIT DONATION MODAL ─────────────────────────────────────────────────────
export function EditDonationModal({ item, onClose, onSave }: { item: DonationItem; onClose: () => void; onSave: (updated: DonationItem) => void }) {
  const [title, setTitle] = useState(item.title);
  const [desc, setDesc] = useState(item.description);
  const [cat, setCat] = useState(item.category);
  const [loc, setLoc] = useState(item.location);
  const [cond, setCond] = useState(item.condition);
  const [photos, setPhotos] = useState<string[]>(item.images ?? (item.image ? [item.image] : []));
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => { const r = e.target?.result as string; if (r) setPhotos(prev => [...prev, r].slice(0, 5)); };
      reader.readAsDataURL(file);
    });
  };

  const save = () => {
    if (!title.trim() || !desc.trim() || !cat || !loc || !cond) { setError('Пополни ги сите полиња.'); return; }
    const colors = CATEGORY_COLORS[cat] || { card: item.cardColor, accent: item.accentColor };
    const emoji = POST_CATEGORIES.find(c => c.id === cat)?.emoji || item.emoji;
    onSave({ ...item, title, description: desc, category: cat, location: loc, condition: cond as DonationItem['condition'], cardColor: colors.card, accentColor: colors.accent, emoji, image: photos[0], images: photos });
  };

  const inputStyle: React.CSSProperties = { border: '2px solid #EDE5D8', borderRadius: 0, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none', width: '100%' };

  return (
    <div aria-hidden="true" className="modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="edit-modal-title" className="modal-inner" style={{ animation: 'scaleIn 0.22s ease', background: 'white', borderRadius: 0, padding: '32px', width: 'min(560px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div id="edit-modal-title" style={{ fontSize: 30, fontWeight: 900, color: '#0f52a1', fontFamily: "var(--font-amatic-sc), var(--font-neucha), cursive" }}>Уреди донација</div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => readFiles(e.target.files)} />
          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>ФОТОГРАФИИ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 0, overflow: 'hidden', background: '#eee' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} aria-label={`Отстрани слика ${i + 1}`} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CloseIcon /></button>
              </div>
            ))}
            {photos.length < 5 && <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: 0, border: '2px dashed #e1b3ec', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#0f52a1', fontWeight: 900 }}>+</div>}
          </div>
          <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="Наслов" style={inputStyle} />
          <textarea value={desc} onChange={e => { setDesc(e.target.value); setError(''); }} placeholder="Опис" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />
          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>КАТЕГОРИЈА</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {POST_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCat(c.id); setError(''); }} style={{ background: cat === c.id ? '#0f52a1' : '#F5F5F5', color: cat === c.id ? 'white' : '#555', border: 'none', borderRadius: 0, padding: '10px 6px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <CategoryIcon id={c.id} size={22} />{c.id}
              </button>
            ))}
          </div>
          <CityDropdown value={loc} onChange={v => { setLoc(v); setError(''); }} error={!!error && !loc} />
          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>СОСТОЈБА</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['Одлична','Добра','Солидна'] as const).map(c => (
              <button key={c} onClick={() => { setCond(c); setError(''); }} style={{ flex: 1, background: cond === c ? '#0f52a1' : '#F5F5F5', color: cond === c ? 'white' : '#555', border: 'none', borderRadius: 0, padding: '12px 8px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>{c}</button>
            ))}
          </div>
          {error && <div role="alert" style={{ padding: '10px 14px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 0, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>{error}</div>}
        </div>
        <div className="modal-buttons" style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '2px solid #e1b3ec', borderRadius: 0, padding: '14px', fontSize: 14, fontWeight: 600, cursor: 'pointer', color: '#0f52a1', textTransform: 'uppercase' }}>Откажи</button>
          <button onClick={save} style={{ flex: 2, background: '#fe613e', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '14px', fontSize: 15, fontWeight: 600, cursor: 'pointer', color: 'white' }}>Зачувај промени</button>
        </div>
      </div>
    </div>
  );
}
