'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DonationItem, ChatMessage } from '@/types';
import InterestButton from './components/InterestButton';
import ChatScreen from './components/ChatScreen';
import { CATEGORIES, POST_CATEGORIES, CATEGORY_COLORS, MK_CITIES } from '@/data/donations';
import { supabase } from '@/lib/supabase';
import { formatDate, mapDonation } from '@/lib/utils';

type ActiveView = 'feed' | 'interests' | 'my-donations' | 'messages';

// ─── ICONS ────────────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function HeartIcon({ filled = false, size = 15 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
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

function EyeIcon({ show }: { show: boolean }) {
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

function PersonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function PinIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function CalendarIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );
}

function LogoutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function GiftIcon({ size = 16 }: { size?: number }) {
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

function ChatBubbleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

function CategoryIcon({ id, size = 18 }: { id: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const };
  switch (id) {
    case 'Сите':    return <svg {...p}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
    case 'Облека':  return <svg {...p}><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/></svg>;
    case 'Книги':   return <svg {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
    case 'Играчки': return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'Мебел':   return <svg {...p}><path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7H2z"/><line x1="6" y1="18" x2="6" y2="21"/><line x1="18" y1="18" x2="18" y2="21"/></svg>;
    case 'Кујна':   return <svg {...p}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>;
    case 'Електро': return <svg {...p}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
    default:        return <svg {...p}><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>;
  }
}

// ─── SKELETON CARD ────────────────────────────────────────────────────────────
function DonationCardSkeleton() {
  const pulse: React.CSSProperties = {
    background: '#EDE5D8',
    animation: 'shimmer 1.6s ease-in-out infinite',
    borderRadius: 8,
  };
  return (
    <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
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

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed', bottom: 36, left: '50%',
        animation: 'slideUpFade 0.3s ease forwards',
        background: '#1A1A2E', color: 'white', padding: '14px 28px',
        borderRadius: 50, fontSize: 15, fontWeight: 800, zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.22)', whiteSpace: 'nowrap',
      }}
    >
      {message}
    </div>
  );
}

// ─── CONDITION BADGE ──────────────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { bg: string; color: string; icon: string }> = {
    'Одлична': { bg: '#E8F8F5', color: '#1ABC9C', icon: '★' },
    'Добра':   { bg: '#EBF5FB', color: '#2E86C1', icon: '✓' },
    'Солидна': { bg: '#FEF9E7', color: '#E67E22', icon: '◎' },
  };
  const s = map[condition] || { bg: '#f0f0f0', color: '#888', icon: '•' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 50, padding: '5px 12px',
      fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span aria-hidden="true">{s.icon}</span>
      <span>Состојба: {condition}</span>
    </span>
  );
}

// ─── DONATION CARD ────────────────────────────────────────────────────────────
function DonationCard({ item, onClick, onInterest, isLoggedIn, isInterested, interestDisabled = false, isOwn = false }: {
  item: DonationItem;
  onClick: () => void;
  onInterest: () => void;
  isLoggedIn: boolean;
  isInterested: boolean;
  interestDisabled?: boolean;
  isOwn?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${item.title} — ${item.condition} — ${item.location}`}
      onClick={onClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); }
        if (e.key === 'l' || e.key === 'L') { e.preventDefault(); if (isLoggedIn && !interestDisabled) onInterest(); }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'white', borderRadius: 24, overflow: 'hidden', cursor: 'pointer',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.13)' : '0 4px 20px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{
        background: item.cardColor, height: 160,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', fontSize: 76, overflow: 'hidden',
      }}>
        {item.image
          ? <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized={item.image.startsWith('data:')} />
          : <span aria-hidden="true">{item.emoji}</span>}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'white', borderRadius: 50, padding: '4px 12px',
          fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <span style={{ color: '#E74C3C' }}><HeartIcon /></span>
          <span>{item.interestedCount}</span>
        </div>
      </div>

      <div style={{ padding: '18px' }}>
        {/* Donor name */}
        <div style={{ fontSize: 13, fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <PersonIcon /> {item.donorName}
        </div>

        <div title={item.title} style={{ fontWeight: 900, fontSize: 17, marginBottom: 12, color: '#1A1A2E', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          <ConditionBadge condition={item.condition} />
          {(item.createdAtISO || item.createdAt) && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarIcon /> {formatDate(item.createdAtISO, item.createdAt)}
            </span>
          )}
        </div>

        {/* Location + Interest button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{
            background: '#F5F5F5', borderRadius: 50, padding: '4px 10px',
            fontSize: 12, fontWeight: 700, color: '#888',
            display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
          }}>
            <PinIcon /> {item.location}
          </span>
          {!isOwn && <InterestButton isLiked={isInterested} onToggle={onInterest} size="sm" disabled={interestDisabled} />}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onInterest, isLoggedIn, onAuthRequired, onCreateProfile, isInterested, interestDisabled, userId, userName }: {
  item: DonationItem;
  onClose: () => void;
  onInterest: () => void;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  onCreateProfile: () => void;
  isInterested: boolean;
  interestDisabled?: boolean;
  userId: string | null;
  userName: string;
}) {
  const isOwn = !!userId && item.userId === userId;
  const [screen, setScreen] = useState<'detail' | 'chat'>('detail');
  const [guestSheet, setGuestSheet] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');
  const allImages = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const guestInputRef = useRef<HTMLInputElement>(null);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key: close chat first, then modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (guestSheet) { setGuestSheet(false); return; }
        if (screen === 'chat') { setScreen('detail'); return; }
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, screen, guestSheet]);

  // Auto-focus guest name input when sheet opens
  useEffect(() => {
    if (guestSheet) setTimeout(() => guestInputRef.current?.focus(), 50);
  }, [guestSheet]);

  const handleContactClick = () => {
    if (isLoggedIn) {
      setScreen('chat');
    } else {
      setGuestSheet(true);
    }
  };

  const handleGuestSubmit = () => {
    if (!guestNameInput.trim()) return;
    setGuestSheet(false);
    setScreen('chat');
  };

  return (
    <div
      onClick={onClose}
      aria-hidden="true"
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 200, backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          borderRadius: 28,
          width: 'min(560px, 100%)', height: 'min(90vh, 720px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          animation: 'scaleIn 0.22s ease',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Sliding track: detail panel (left) + chat screen (right) ── */}
        <div style={{
          display: 'flex',
          height: '100%',
          width: '200%',
          transform: screen === 'chat' ? 'translateX(-50%)' : 'translateX(0)',
          transition: 'transform 300ms ease-in-out',
        }}>

          {/* ── DETAIL PANEL ── */}
          <div style={{
            width: '50%', height: '100%',
            display: 'flex', flexDirection: 'column',
            background: 'white', overflow: 'hidden',
          }}>
            {/* Hero image */}
            <div style={{
              background: item.cardColor, flexShrink: 0,
              display: 'flex', flexDirection: 'column',
              position: 'relative',
            }}>
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 110, position: 'relative' }}>
                {allImages.length > 0
                  ? <Image src={allImages[activeImg]} alt={item.title} fill style={{ objectFit: 'contain' }} unoptimized={allImages[activeImg].startsWith('data:')} />
                  : item.emoji}

                {allImages.length > 1 && (
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + allImages.length) % allImages.length)}
                    aria-label="Претходна слика"
                    style={{
                      position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
                      width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >‹</button>
                )}
                {allImages.length > 1 && (
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % allImages.length)}
                    aria-label="Следна слика"
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%',
                      width: 36, height: 36, cursor: 'pointer', fontSize: 16, fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    }}
                  >›</button>
                )}
              </div>

              {allImages.length > 1 && (
                <div style={{ display: 'flex', gap: 8, padding: '10px 14px', background: '#F0EAFF', overflowX: 'auto' }} role="tablist" aria-label="Сликовна галерија">
                  {allImages.map((src, i) => (
                    <Image
                      key={i} src={src} alt={`Слика ${i + 1}`} width={56} height={56}
                      role="tab" tabIndex={0} aria-selected={activeImg === i}
                      onClick={() => setActiveImg(i)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveImg(i); } }}
                      unoptimized={src.startsWith('data:')}
                      style={{
                        objectFit: 'contain', borderRadius: 10, flexShrink: 0,
                        background: 'white', cursor: 'pointer',
                        border: activeImg === i ? '2.5px solid #7B4FFF' : '2.5px solid transparent',
                        opacity: activeImg === i ? 1 : 0.7,
                        transition: 'all 0.15s',
                      }}
                    />
                  ))}
                </div>
              )}

              <button
                onClick={onClose}
                aria-label="Затвори"
                style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'white', border: 'none', borderRadius: 50,
                  width: 38, height: 38, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#666', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                }}
              ><CloseIcon /></button>

              <div style={{
                position: 'absolute', top: 14, left: 14,
                background: 'white', borderRadius: 50,
                padding: '5px 14px', fontSize: 12, fontWeight: 800,
                color: item.accentColor, boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}>
                {item.category}
              </div>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <h2 id="detail-modal-title" style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>{item.title}</h2>
                <ConditionBadge condition={item.condition} />
              </div>

              <p style={{ fontSize: 14, color: '#777', lineHeight: 1.65, marginBottom: 20, fontWeight: 700 }}>
                {item.description}
              </p>

              <div style={{
                background: '#F5F0FF', borderRadius: 16, padding: '16px',
                marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                {[
                  { icon: <PersonIcon />, label: 'Донатор', value: item.donorName },
                  { icon: <PinIcon size={13} />, label: 'Локација', value: item.location },
                  { icon: <HeartIcon size={13} />, label: 'Заинтересирани', value: `${item.interestedCount} луѓе` },
                  { icon: <CalendarIcon size={13} />, label: 'Постирано', value: formatDate(item.createdAtISO, item.createdAt) },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, color: '#999', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{r.icon} {r.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#1A1A2E' }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            {!isOwn && (
              <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #F0EBE0', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    onClick={handleContactClick}
                    style={{
                      flex: 2, background: '#FF6B4A', color: 'white',
                      border: 'none', borderRadius: 50, padding: '16px',
                      fontSize: 16, fontWeight: 900, cursor: 'pointer',
                      transition: 'opacity 0.15s',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <ChatBubbleIcon size={16} /> Контактирај
                  </button>
                  <div style={{ flex: 1 }}>
                    <InterestButton isLiked={isInterested} onToggle={onInterest} size="lg" disabled={interestDisabled} />
                  </div>
                </div>
              </div>
            )}
            {isOwn && <div style={{ height: 24 }} />}
          </div>

          {/* ── CHAT SCREEN ── only mount when active to prevent premature focus/scroll */}
          <div style={{ width: '50%', height: '100%', overflow: 'hidden' }}>
            {screen === 'chat' && (
              <ChatScreen
                item={item}
                userId={isLoggedIn ? userId : null}
                userName={isLoggedIn ? userName : guestNameInput}
                onBack={() => setScreen('detail')}
              />
            )}
          </div>
        </div>

        {/* ── GUEST NAME BOTTOM SHEET ── */}
        {guestSheet && (
          <>
            <div
              onClick={() => setGuestSheet(false)}
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)',
                zIndex: 10,
              }}
            />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'white', borderRadius: '20px 20px 0 0',
              padding: '28px 28px 36px',
              zIndex: 11,
              animation: 'slideUpSheet 0.25s ease',
            }}>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#1A1A2E', marginBottom: 6 }}>
                Со кое име да те претставиме?
              </div>
              <div style={{ fontSize: 13, color: '#aaa', fontWeight: 700, marginBottom: 20 }}>
                Донаторот ќе те види под ова име
              </div>
              <input
                ref={guestInputRef}
                value={guestNameInput}
                onChange={e => setGuestNameInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGuestSubmit()}
                placeholder="Твое име или прекар"
                style={{
                  width: '100%', border: '2px solid #EDE5D8', borderRadius: 50,
                  padding: '13px 20px', fontSize: 15, fontWeight: 700,
                  outline: 'none', marginBottom: 12, boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#FF6B4A')}
                onBlur={e => (e.currentTarget.style.borderColor = '#EDE5D8')}
              />
              <button
                onClick={handleGuestSubmit}
                style={{
                  width: '100%', background: '#FF6B4A', color: 'white',
                  border: 'none', borderRadius: 50, padding: '14px',
                  fontSize: 15, fontWeight: 900, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                Продолжи →
              </button>
              <div style={{ textAlign: 'center', fontSize: 12, color: '#bbb', fontWeight: 700, marginTop: 16 }}>
                Или{' '}
                <button
                  onClick={() => { setGuestSheet(false); onAuthRequired(); }}
                  style={{
                    background: 'none', border: 'none', color: '#7B4FFF',
                    fontWeight: 800, fontSize: 12, cursor: 'pointer', padding: 0,
                  }}
                >
                  најави се
                </button>
                {' '}за да ги зачуваш разговорите
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── CITY DROPDOWN ────────────────────────────────────────────────────────────
function CityDropdown({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          border: `2px solid ${error ? '#E74C3C' : open ? '#FF6B4A' : '#EDE5D8'}`,
          borderRadius: 16, padding: '14px 18px', fontSize: 15, fontWeight: 700,
          background: 'white', cursor: 'pointer', transition: 'border-color 0.2s',
          color: value ? '#1A1A2E' : '#aaa',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PinIcon size={15} />
          <span>{value || 'Избери општина *'}</span>
        </span>
        <span style={{ fontSize: 12, color: '#aaa' }}>▾</span>
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 600,
          background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          maxHeight: 240, overflowY: 'auto', padding: '8px 0',
        }}>
          {MK_CITIES.map(c => (
            <div
              key={c}
              onClick={() => { onChange(c); setOpen(false); }}
              style={{
                padding: '10px 18px', fontSize: 14, fontWeight: 700,
                color: value === c ? '#C04400' : '#1A1A2E',
                background: value === c ? '#FFF0EC' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (value !== c) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === c ? '#FFF0EC' : 'transparent'; }}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterCityDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'white', borderRadius: 50, padding: '8px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: value ? '2px solid #FF6B4A' : '2px solid transparent',
          transition: 'border-color 0.2s', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <PinIcon size={16} />
        <span style={{ fontSize: 14, fontWeight: 700, color: value ? '#C04400' : '#AAA', whiteSpace: 'nowrap' }}>
          {value || 'Сите општини'}
        </span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#C04400', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
          : <span style={{ color: '#AAA', fontSize: 18, marginLeft: 2 }}>▾</span>
        }
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 600,
          background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          maxHeight: 280, overflowY: 'auto', minWidth: 200, padding: '8px 0',
        }}>
          {['', ...MK_CITIES].map(c => (
            <div
              key={c || '__all__'}
              onClick={() => { onChange(c); setOpen(false); }}
              style={{
                padding: '10px 18px', fontSize: 14, fontWeight: 700,
                color: value === c ? '#C04400' : '#1A1A2E',
                background: value === c ? '#FFF0EC' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (value !== c) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === c ? '#FFF0EC' : 'transparent'; }}
            >
              {c || 'Сите општини'}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DateFilterDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const options = [
    { id: '', label: 'Сите датуми' },
    { id: 'today', label: 'Денес' },
    { id: 'week', label: 'Оваа недела' },
    { id: 'month', label: 'Овој месец' },
    { id: 'year', label: 'Оваа година' },
  ];
  const selected = options.find(o => o.id === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'white', borderRadius: 50, padding: '8px 20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          border: value ? '2px solid #FF6B4A' : '2px solid transparent',
          transition: 'border-color 0.2s', cursor: 'pointer', userSelect: 'none',
        }}
      >
        <CalendarIcon size={16} />
        <span style={{ fontSize: 14, fontWeight: 700, color: value ? '#C04400' : '#AAA', whiteSpace: 'nowrap' }}>
          {selected.label}
        </span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#C04400', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
          : <span style={{ color: '#AAA', fontSize: 18, marginLeft: 2 }}>▾</span>
        }
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 600,
          background: 'white', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
          minWidth: 180, padding: '8px 0',
        }}>
          {options.map(o => (
            <div
              key={o.id || '__all__'}
              onClick={() => { onChange(o.id); setOpen(false); }}
              style={{
                padding: '10px 18px', fontSize: 14, fontWeight: 700,
                color: value === o.id ? '#C04400' : '#1A1A2E',
                background: value === o.id ? '#FFF0EC' : 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (value !== o.id) e.currentTarget.style.background = '#F8F4F0'; }}
              onMouseLeave={e => { e.currentTarget.style.background = value === o.id ? '#FFF0EC' : 'transparent'; }}
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── POST MODAL ───────────────────────────────────────────────────────────────
function PostModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (data: Partial<DonationItem>) => Promise<void>;
}) {
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

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    const toRead = Array.from(files).slice(0, 5 - photos.length);
    toRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) setPhotos(prev => [...prev, result].slice(0, 5));
      };
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
      else if (step === 3) setError('Внеси локација и избери состојба на предметот.');
      return;
    }
    setError('');
    if (step < 3) { setStep(s => s + 1); return; }
    await submit();
  };

  const submit = async () => {
    const colors = CATEGORY_COLORS[cat] || { card: '#F5F5F5', accent: '#888' };
    const emoji = POST_CATEGORIES.find(c => c.id === cat)?.emoji || '🎁';
    setSubmitting(true);
    await onSubmit({ title, description: desc, category: cat, condition: cond as DonationItem['condition'], location: loc, emoji, cardColor: colors.card, accentColor: colors.accent, image: photos[0], images: photos });
    setSubmitting(false);
  };

  const stepTitles = ['Додај фотографии', 'Детали за предметот', 'Локација и состојба'];

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-modal-title"
        style={{
          animation: 'scaleIn 0.22s ease',
          background: 'white', borderRadius: 28, padding: '32px',
          width: 'min(560px, 100%)', zIndex: 301,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div id="post-modal-title" style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E' }}>{stepTitles[step - 1]}</div>
            <div style={{ fontSize: 14, color: '#aaa', fontWeight: 700, marginTop: 4 }}>Чекор {step} од 3</div>
          </div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>

        <div style={{ display: 'flex', gap: 8, margin: '20px 0 28px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: 6, borderRadius: 3, background: s <= step ? '#FF6B4A' : '#EDE5D8', transition: 'background 0.3s' }} />
          ))}
        </div>

        {step === 1 && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => readFiles(e.target.files)}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); readFiles(e.dataTransfer.files); }}
              style={{
                border: `2px dashed ${dragOver ? '#FF6B4A' : error ? '#E74C3C' : '#C9B8E8'}`,
                borderRadius: 20, padding: '48px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: dragOver ? '#FFF0EC' : '#F8F4FF',
                marginBottom: photos.length > 0 ? 16 : 0, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 44, marginBottom: 12 }}>📷</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#555', marginBottom: 6 }}>Клик или повлечи слики овде</div>
              <div style={{ fontSize: 13, color: '#bbb', fontWeight: 700 }}>PNG, JPG до 10MB · до 5 слики</div>
            </div>
            {photos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                {photos.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#eee' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                      aria-label={`Отстрани слика ${i + 1}`}
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      <CloseIcon />
                    </button>
                  </div>
                ))}
                {photos.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed #C9B8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#9B59B6', fontWeight: 900 }}>+</div>
                )}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="Наслов на предметот *"
              style={{ border: `2px solid ${error && !title.trim() ? '#E74C3C' : '#EDE5D8'}`, borderRadius: 16, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none' }} />
            <textarea value={desc} onChange={e => { setDesc(e.target.value); setError(''); }} placeholder="Опис (состојба, бројка, возраст...) *" rows={4}
              style={{ border: `2px solid ${error && !desc.trim() ? '#E74C3C' : '#EDE5D8'}`, borderRadius: 16, padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none', resize: 'vertical' }} />
            <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>КАТЕГОРИЈА *</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {POST_CATEGORIES.map(c => (
                <button key={c.id} onClick={() => { setCat(c.id); setError(''); }} style={{
                  background: cat === c.id ? '#1A1A2E' : '#F5F5F5',
                  color: cat === c.id ? 'white' : '#555',
                  border: error && !cat ? '2px solid #E74C3C' : '2px solid transparent',
                  borderRadius: 16, padding: '14px 8px',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 26 }}>{c.emoji}</span>{c.id}
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
                <button key={c} onClick={() => { setCond(c); setError(''); }} style={{
                  flex: 1, background: cond === c ? '#1A1A2E' : '#F5F5F5',
                  color: cond === c ? 'white' : '#555',
                  border: error && !cond ? '2px solid #E74C3C' : '2px solid transparent',
                  borderRadius: 16, padding: '14px 8px',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                }}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div role="alert" style={{ marginTop: 16, padding: '12px 16px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && (
            <button onClick={() => { setStep(s => s - 1); setError(''); }}
              style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 50, padding: '16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', color: '#555' }}>
              ← Назад
            </button>
          )}
          <button
            onClick={tryAdvance}
            disabled={submitting}
            aria-busy={submitting}
            style={{ flex: 2, background: '#FF6B4A', border: 'none', borderRadius: 50, padding: '16px', fontSize: 16, fontWeight: 900, cursor: submitting ? 'default' : 'pointer', color: 'white', transition: 'opacity 0.15s', opacity: submitting ? 0.7 : 1 }}
            onMouseEnter={e => { if (!submitting) e.currentTarget.style.opacity = '0.9'; }}
            onMouseLeave={e => { if (!submitting) e.currentTarget.style.opacity = '1'; }}
          >
            {submitting ? 'Момент...' : step === 3 ? 'Објави!' : 'Следно →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onSubmit, onForgotPassword, defaultTab = 'login' }: {
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

  // Escape key to close
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
    const result = await onSubmit({ tab, email, pass, name });
    setSubmitting(false);
    if (result === '__reg_success__') {
      // Registration succeeded — switch to login tab with a success hint
      setTab('login');
      setPass(''); setConfirmPass(''); setName('');
      setSupaError('');
      setRegDone(true);
    } else if (result) {
      setSupaError(result);
    }
  };

  const submitForgot = async () => {
    if (!validEmail(email)) { setEmailError('Внеси валидна е-мејл адреса'); return; }
    setEmailError(''); setSupaError('');
    setSubmitting(true);
    const err = await onForgotPassword(email);
    setSubmitting(false);
    if (err) setSupaError(err);
    else setResetSent(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '2px solid #EDE5D8', borderRadius: 16,
    padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none',
  };

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'scaleIn 0.22s ease',
          background: 'white', borderRadius: 28, padding: '32px',
          width: 'min(440px, 100%)', zIndex: 301,
          boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <div id="auth-modal-title" style={{ fontSize: 22, fontWeight: 900 }}>
            {forgot ? 'Заборавена лозинка' : tab === 'login' ? 'Најави се' : 'Регистрирај се'}
          </div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>

        {/* ── Forgot password view ── */}
        {forgot ? (
          resetSent ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📧</div>
              <div style={{ fontWeight: 900, fontSize: 16, color: '#1A1A2E', marginBottom: 8 }}>Линкот е испратен!</div>
              <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 20 }}>
                Провери го е-мејлот и кликни на линкот за да ја ресетираш лозинката.
              </div>
              <button onClick={() => { setForgot(false); clearAll(); }} style={{ background: '#1A1A2E', color: 'white', border: 'none', borderRadius: 50, padding: '12px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                Назад кон најава
              </button>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 16 }}>
                Внеси ја твојата е-мејл адреса и ќе ти испратиме линк за ресетирање на лозинката.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <input value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder="Е-мејл" type="email"
                  style={{ ...inputStyle, borderColor: emailError ? '#E74C3C' : '#EDE5D8' }} />
                {emailError && <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>⚠️ {emailError}</div>}
                {supaError && <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>⚠️ {supaError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setForgot(false); clearAll(); }} style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', color: '#555' }}>
                  Назад
                </button>
                <button onClick={submitForgot} disabled={submitting} style={{ flex: 2, background: '#FF6B4A', border: 'none', borderRadius: 50, padding: '14px', fontSize: 15, fontWeight: 900, cursor: 'pointer', color: 'white', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Момент...' : 'Испрати линк'}
                </button>
              </div>
            </>
          )
        ) : (
          <>
            <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 50, padding: 4, marginBottom: 22 }}>
              {(['login','reg'] as const).map(t => (
                <button key={t} onClick={() => { setTab(t); clearAll(); setForgot(false); setRegDone(false); }} style={{
                  flex: 1, background: tab === t ? '#1A1A2E' : 'transparent',
                  color: tab === t ? 'white' : '#888',
                  border: 'none', borderRadius: 50, padding: '10px',
                  fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                }}>{t === 'reg' ? 'Регистрација' : 'Најава'}</button>
              ))}
            </div>

            {regDone && tab === 'login' && (
              <div style={{ background: '#E8F5E9', color: '#2E7D32', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                ✅ Успешно се регистриравте! Сега најавете се.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tab === 'reg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="auth-name" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ИМЕ</label>
                  <input id="auth-name" value={name} onChange={e => setName(e.target.value)} placeholder="Вашето ime" autoComplete="name" style={inputStyle} />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="auth-email" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>Е-МЕЈЛ</label>
                <input id="auth-email" value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder="Е-мејл" type="email" autoComplete="email"
                  style={{ ...inputStyle, borderColor: emailError ? '#E74C3C' : '#EDE5D8' }} />
                {emailError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>{emailError}</div>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <label htmlFor="auth-pass" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ЛОЗИНКА</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="auth-pass" value={pass} onChange={e => { setPass(e.target.value); setPassError(''); }} placeholder="Лозинка" type={showPass ? 'text' : 'password'} autoComplete={tab === 'reg' ? 'new-password' : 'current-password'} style={{ ...inputStyle, paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Скриј лозинка' : 'Прикажи лозинка'}
                    style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 0 }}>
                    <EyeIcon show={showPass} />
                  </button>
                </div>
              </div>
              {tab === 'reg' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <label htmlFor="auth-confirm-pass" style={{ fontSize: 12, fontWeight: 800, color: '#aaa' }}>ПОТВРДИ ЛОЗИНКА</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input id="auth-confirm-pass" value={confirmPass} onChange={e => { setConfirmPass(e.target.value); setPassError(''); }} placeholder="Потврди лозинка" type={showConfirmPass ? 'text' : 'password'} autoComplete="new-password"
                      style={{ ...inputStyle, borderColor: passError ? '#E74C3C' : '#EDE5D8', paddingRight: 48 }} />
                    <button type="button" onClick={() => setShowConfirmPass(v => !v)} aria-label={showConfirmPass ? 'Скриј лозинка' : 'Прикажи лозинка'}
                      style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', padding: 0 }}>
                      <EyeIcon show={showConfirmPass} />
                    </button>
                  </div>
                  {passError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>{passError}</div>}
                </div>
              )}
            </div>

            {tab === 'login' && (
              <button onClick={() => { setForgot(true); setSupaError(''); setEmailError(''); }} style={{ background: 'none', border: 'none', padding: '8px 0 0', fontSize: 13, fontWeight: 700, color: '#7B4FFF', cursor: 'pointer', textAlign: 'left' }}>
                Забравена лозинка?
              </button>
            )}

            {supaError && <div role="alert" style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4, marginTop: 4 }}>{supaError}</div>}
            <button onClick={submit} disabled={submitting} style={{
              width: '100%', background: '#FF6B4A', border: 'none', borderRadius: 50,
              padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', color: 'white', marginTop: 16,
              opacity: submitting ? 0.7 : 1,
            }}>{submitting ? 'Момент...' : (tab === 'reg' ? 'Регистрирај се' : 'Најави се')}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── EDIT DONATION MODAL ──────────────────────────────────────────────────────
function EditDonationModal({ item, onClose, onSave }: {
  item: DonationItem;
  onClose: () => void;
  onSave: (updated: DonationItem) => void;
}) {
  const [title, setTitle] = useState(item.title);
  const [desc, setDesc] = useState(item.description);
  const [cat, setCat] = useState(item.category);
  const [loc, setLoc] = useState(item.location);
  const [cond, setCond] = useState(item.condition);
  const [photos, setPhotos] = useState<string[]>(item.images ?? (item.image ? [item.image] : []));
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Escape key to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const readFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const result = e.target?.result as string;
        if (result) setPhotos(prev => [...prev, result].slice(0, 5));
      };
      reader.readAsDataURL(file);
    });
  };

  const save = () => {
    if (!title.trim() || !desc.trim() || !cat || !loc || !cond) {
      setError('Пополни ги сите полиња.');
      return;
    }
    const colors = CATEGORY_COLORS[cat] || { card: item.cardColor, accent: item.accentColor };
    const emoji = POST_CATEGORIES.find(c => c.id === cat)?.emoji || item.emoji;
    onSave({ ...item, title, description: desc, category: cat, location: loc, condition: cond as DonationItem['condition'], cardColor: colors.card, accentColor: colors.accent, emoji, image: photos[0], images: photos });
  };

  const inputStyle: React.CSSProperties = {
    border: '2px solid #EDE5D8', borderRadius: 16, padding: '14px 18px',
    fontSize: 15, fontWeight: 700, outline: 'none', width: '100%',
  };

  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        style={{ animation: 'scaleIn 0.22s ease', background: 'white', borderRadius: 28, padding: '32px', width: 'min(560px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div id="edit-modal-title" style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E' }}>Уреди донација</div>
          <button onClick={onClose} aria-label="Затвори" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}><CloseIcon /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Photo upload */}
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => readFiles(e.target.files)} />
          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>ФОТОГРАФИИ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#eee' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} aria-label={`Отстрани слика ${i + 1}`} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CloseIcon /></button>
              </div>
            ))}
            {photos.length < 5 && (
              <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: 14, border: '2px dashed #C9B8E8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 24, color: '#9B59B6', fontWeight: 900 }}>+</div>
            )}
          </div>

          <input value={title} onChange={e => { setTitle(e.target.value); setError(''); }} placeholder="Наслов" style={inputStyle} />
          <textarea value={desc} onChange={e => { setDesc(e.target.value); setError(''); }} placeholder="Опис" rows={4} style={{ ...inputStyle, resize: 'vertical' }} />

          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>КАТЕГОРИЈА</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {POST_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => { setCat(c.id); setError(''); }} style={{
                background: cat === c.id ? '#1A1A2E' : '#F5F5F5',
                color: cat === c.id ? 'white' : '#555',
                border: 'none', borderRadius: 14, padding: '10px 6px',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}>
                <span style={{ fontSize: 20 }}>{c.emoji}</span>{c.id}
              </button>
            ))}
          </div>

          <CityDropdown value={loc} onChange={v => { setLoc(v); setError(''); }} error={!!error && !loc} />

          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>СОСТОЈБА</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {(['Одлична','Добра','Солидна'] as const).map(c => (
              <button key={c} onClick={() => { setCond(c); setError(''); }} style={{
                flex: 1, background: cond === c ? '#1A1A2E' : '#F5F5F5',
                color: cond === c ? 'white' : '#555',
                border: 'none', borderRadius: 16, padding: '12px 8px',
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>{c}</button>
            ))}
          </div>

          {error && (
            <div role="alert" style={{ padding: '10px 14px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>
              {error}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', color: '#555' }}>
            Откажи
          </button>
          <button onClick={save} style={{ flex: 2, background: '#FF6B4A', border: 'none', borderRadius: 50, padding: '14px', fontSize: 15, fontWeight: 900, cursor: 'pointer', color: 'white' }}>
            Зачувај промени
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center', color: '#C4B5A0' }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#555' }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
type Conversation = { item: DonationItem; msgs: ChatMessage[]; lastMsgAt: string };

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('Сите');
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState<DonationItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<null | 'post' | 'auth'>(null);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'reg'>('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openMessageItemId, setOpenMessageItemId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<DonationItem | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pendingInterestIds, setPendingInterestIds] = useState<Set<string>>(new Set());
  const [readConversationIds, setReadConversationIds] = useState<Set<string>>(new Set());
  const avatarRef = useRef<HTMLDivElement>(null);
  const didLogOutRef = useRef(false);

  // Mobile detection
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
      if (!e.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const uid = useCallback(() => Date.now().toString(36) + Math.random().toString(36).slice(2), []);
  const showToast = (msg: string) => setToast(msg);

  // ── Data loaders ─────────────────────────────────────────────────────────────

  const loadDonations = async () => {
    const { data } = await supabase
      .from('donations').select('*').order('created_at_iso', { ascending: false });
    setDonations((data || []).map(mapDonation));
    setLoading(false);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadConversations = async (uid: string) => {
    // Messages I sent
    const { data: sent } = await supabase
      .from('messages').select('*').eq('sender_id', uid).order('created_at', { ascending: true });

    // Messages received on my donations
    const { data: myDons } = await supabase.from('donations').select('id').eq('user_id', uid);
    const myDonIds = (myDons || []).map((d: any) => d.id as string);
    const { data: received } = myDonIds.length > 0
      ? await supabase.from('messages').select('*').in('donation_id', myDonIds).neq('sender_id', uid).order('created_at', { ascending: true })
      : { data: [] };

    // Merge and deduplicate by id
    const allMsgs = [...(sent || []), ...(received || [])];
    const unique = Array.from(new Map(allMsgs.map((m: any) => [m.id, m])).values())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    if (unique.length === 0) { setConversations({}); return; }

    const donIds = [...new Set(unique.map((m: any) => m.donation_id as string))];
    const { data: items } = await supabase.from('donations').select('*').in('id', donIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemMap = new Map((items || []).map((d: any) => [d.id, mapDonation(d)]));
    const convMap: Record<string, Conversation> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const msg of unique as any[]) {
      const item = itemMap.get(msg.donation_id);
      if (!item) continue;
      if (!convMap[msg.donation_id]) convMap[msg.donation_id] = { item, msgs: [], lastMsgAt: msg.created_at };
      convMap[msg.donation_id].lastMsgAt = msg.created_at;
      convMap[msg.donation_id].msgs.push({
        id: msg.id, sender: msg.sender_name, text: msg.text,
        isOwn: msg.sender_id === uid,
        time: new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setConversations(convMap);
    setReadConversationIds(prev => new Set([...prev, ...Object.keys(convMap)]));
  };

  // ── Effects ──────────────────────────────────────────────────────────────────

  // Load all donations on mount + subscribe to realtime changes
  useEffect(() => {
    loadDonations();
    const channel = supabase.channel('donations-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, loadDonations)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth state — runs once; Supabase fires immediately with existing session
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_IN') didLogOutRef.current = false;
      if (session?.user && !didLogOutRef.current) {
        const user = session.user;
        const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Корисник';
        setIsLoggedIn(true);
        setUserName(name);
        setUserId(user.id);
        const { data: ints } = await supabase
          .from('interests').select('donation_id').eq('user_id', user.id);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setInterestedIds(new Set((ints || []).map((r: any) => r.donation_id)));
        await loadConversations(user.id);
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setUserId(null);
        setInterestedIds(new Set());
        setConversations({});
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inbox realtime subscription — fires when any message is inserted that this user can see
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('inbox-' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const msg = payload.new as any;
        if (msg.sender_id === userId) return; // ignore my own (already optimistic)
        // Update conversations so inbox + unread badge refresh
        loadConversations(userId);
        // Mark as unread unless that chat is currently open
        setReadConversationIds(prev => {
          const isOpen = activeView === 'messages' && openMessageItemId === msg.donation_id;
          if (isOpen) return prev;
          const s = new Set(prev); s.delete(msg.donation_id); return s;
        });
        // Toast notification
        showToast(`💬 Нова порака од ${msg.sender_name}`);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Close avatar dropdown on outside click
  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [avatarOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleInterest = async (itemId: string) => {
    if (!userId || pendingInterestIds.has(itemId)) return;
    setPendingInterestIds(prev => new Set([...prev, itemId]));
    const adding = !interestedIds.has(itemId);
    const prevIds = new Set(interestedIds);
    // Optimistic update
    const next = new Set(interestedIds);
    if (adding) next.add(itemId); else next.delete(itemId);
    setInterestedIds(next);
    setDonations(prev => prev.map(d =>
      d.id === itemId ? { ...d, interestedCount: d.interestedCount + (adding ? 1 : -1) } : d
    ));
    const { error } = await supabase.rpc('toggle_interest', { p_donation_id: itemId, p_user_id: userId });
    if (error) {
      setInterestedIds(prevIds);
      setDonations(prev => prev.map(d =>
        d.id === itemId ? { ...d, interestedCount: d.interestedCount + (adding ? -1 : 1) } : d
      ));
    } else {
      showToast(adding ? '🎉 Донаторот е известен!' : '💔 Интересот е отстранет');
    }
    setPendingInterestIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
  };


  const handleAddClick = () => { if (!isLoggedIn) setModal('auth'); else setModal('post'); };

  const handleForgotPassword = async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return error ? error.message : null;
  };

  const handleAuthSubmit = async ({ tab, email, pass, name }: { tab: 'login' | 'reg'; email: string; pass: string; name: string }): Promise<string | null> => {
    if (tab === 'reg') {
      const { error } = await supabase.auth.signUp({
        email, password: pass,
        options: { data: { name: name || email.split('@')[0] } },
      });
      if (error) return error.message;
      return '__reg_success__';
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
      if (error) return error.message;
    }
    setModal(null);
    return null;
  };

  const handleLogout = () => {
    didLogOutRef.current = true;
    supabase.auth.signOut(); // fire & forget — don't block on network
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
    setInterestedIds(new Set());
    setConversations({});
    setActiveView('feed');
    setAvatarOpen(false);
    showToast('👋 Се одјавивте успешно.');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setDeleteLoading(false); return; }
    const res = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: { authorization: `Bearer ${session.access_token}` },
    });
    setDeleteLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      showToast(`⚠️ ${body.error ?? 'Грешка при бришење.'}`);
      return;
    }
    setDeleteConfirm(false);
    setAvatarOpen(false);
    didLogOutRef.current = true;
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
    setInterestedIds(new Set());
    setConversations({});
    setActiveView('feed');
    showToast('🗑️ Акаунтот е избришан.');
  };

  const handleEditSave = async (updated: DonationItem) => {
    const { error } = await supabase.from('donations').update({
      title: updated.title, description: updated.description,
      category: updated.category, condition: updated.condition, location: updated.location,
      image: updated.image ?? null, images: updated.images ?? null,
      emoji: updated.emoji, card_color: updated.cardColor, accent_color: updated.accentColor,
    }).eq('id', updated.id);
    if (!error) {
      setDonations(prev => prev.map(d => d.id === updated.id ? updated : d));
      setEditItem(null);
      showToast('✅ Донацијата е ажурирана!');
    }
  };

  const handleDelete = async (itemId: string) => {
    const { error } = await supabase.from('donations').delete().eq('id', itemId);
    if (!error) {
      setDonations(prev => prev.filter(d => d.id !== itemId));
      showToast('🗑️ Донацијата е избришана.');
    }
  };

  const handlePostSubmit = async (data: Partial<DonationItem>): Promise<void> => {
    if (!userId) return;
    const colors = CATEGORY_COLORS[data.category || 'Друго'] || { card: '#F5F5F5', accent: '#888' };
    const emoji = POST_CATEGORIES.find(c => c.id === data.category)?.emoji || '🎁';
    const { error } = await supabase.from('donations').insert({
      title: data.title || 'Нов предмет',
      description: data.description || '',
      category: data.category || 'Друго',
      condition: data.condition || 'Добра',
      location: data.location || 'Скопје',
      donor_name: userName,
      donor_avatar: userName.slice(0, 2).toUpperCase(),
      image: data.image ?? null,
      images: data.images ?? null,
      emoji, card_color: colors.card, accent_color: colors.accent,
      user_id: userId, interested_count: 0,
    });
    if (!error) {
      setModal(null);
      showToast('🎉 Донацијата е објавена!');
      await loadDonations();
    }
  };

  const cities = MK_CITIES;

  const filtered = donations.filter(d => {
    const matchCat = activeCat === 'Сите' || d.category === activeCat;
    const matchQ = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.location.toLowerCase().includes(search.toLowerCase());
    const matchCity = !cityFilter || d.location === cityFilter;
    let matchDate = true;
    if (dateFilter && d.createdAtISO) {
      const now = new Date();
      const created = new Date(d.createdAtISO);
      if (dateFilter === 'today') {
        matchDate = created.toDateString() === now.toDateString();
      } else if (dateFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchDate = created >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
        matchDate = created >= monthAgo;
      } else if (dateFilter === 'year') {
        matchDate = created.getFullYear() === now.getFullYear();
      }
    }
    return matchCat && matchQ && matchCity && matchDate;
  });

  const interestedItems = donations.filter(d => interestedIds.has(d.id));
  const myDonations = donations.filter(d => d.userId === userId);

  const navItems: { view: ActiveView; icon: React.ReactNode; label: string }[] = [
    { view: 'interests',    icon: <HeartIcon size={17} />, label: 'Мои интереси' },
    { view: 'my-donations', icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>, label: 'Мои донации' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}>

      {/* ── SKIP LINK ── */}
      <a href="#main-content" className="skip-link">Скокни на содржината</a>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,249,240,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Hamburger — mobile only */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label={mobileMenuOpen ? 'Затвори мени' : 'Отвори мени'}
            aria-expanded={mobileMenuOpen}
            aria-controls="app-sidebar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 10, color: '#1A1A2E' }}
          >
            <MenuIcon open={mobileMenuOpen} />
          </button>

          <button
            onClick={() => setActiveView('feed')}
            aria-label="Донирај.мк — почетна страна"
            style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', letterSpacing: -0.5, cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
          >
            Донирај<span style={{ color: '#FF6B4A' }}>.</span>мк
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleAddClick}
            aria-label="Додај нова донација"
            style={{
              background: '#1A1A2E', color: 'white', border: 'none',
              borderRadius: 50, padding: '10px 20px', fontSize: 14,
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            + Додај донација
          </button>

          {/* Avatar */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button
              onClick={() => isLoggedIn ? setAvatarOpen(o => !o) : setModal('auth')}
              aria-label={isLoggedIn ? `Профил: ${userName}` : 'Најави се'}
              aria-expanded={isLoggedIn ? avatarOpen : undefined}
              style={{
                width: 40, height: 40, borderRadius: 50,
                background: isLoggedIn ? '#FF6B4A' : '#E8E0D5',
                color: isLoggedIn ? 'white' : '#888',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, cursor: 'pointer', border: 'none',
                boxShadow: isLoggedIn ? '0 2px 10px rgba(255,107,74,0.35)' : 'none',
              }}
            >
              {isLoggedIn ? userName.slice(0, 2).toUpperCase() : <UserIcon />}
            </button>
            {avatarOpen && isLoggedIn && (
              <>
                <div style={{
                  position: 'absolute', top: 48, right: 0, zIndex: 401,
                  background: 'white', borderRadius: 16, padding: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 180,
                  animation: 'scaleIn 0.15s ease',
                }}>
                  <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#aaa', borderBottom: '1px solid #f0e8e0', marginBottom: 4 }}>
                    {userName}
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', background: 'none', border: 'none', borderRadius: 10,
                      padding: '10px 14px', fontSize: 14, fontWeight: 800,
                      color: '#E74C3C', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#FFF0EE')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <LogoutIcon size={16} /> Одјави се
                  </button>
                  <button
                    onClick={() => { setDeleteConfirm(true); setAvatarOpen(false); }}
                    style={{
                      width: '100%', background: 'none', border: 'none', borderRadius: 10,
                      padding: '10px 14px', fontSize: 13, fontWeight: 800,
                      color: '#aaa', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 8,
                      borderTop: '1px solid #f5f0ea', marginTop: 4,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    Избриши акаунт
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: 'flex' }}>

        {/* Mobile sidebar overlay */}
        {isMobile && mobileMenuOpen && (
          <div
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: 'fixed', inset: 0, top: 64, background: 'rgba(0,0,0,0.28)', zIndex: 99 }}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside
          id="app-sidebar"
          style={{
            width: 220, flexShrink: 0,
            padding: '24px 14px',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            position: isMobile ? 'fixed' : 'sticky',
            top: 64, height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            display: isMobile && !mobileMenuOpen ? 'none' : 'flex',
            flexDirection: 'column', gap: 4,
            zIndex: isMobile ? 100 : undefined,
            background: '#FFF9F0',
            boxShadow: isMobile && mobileMenuOpen ? '4px 0 24px rgba(0,0,0,0.12)' : undefined,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 900, color: '#C4B5A0', letterSpacing: 1.2, marginBottom: 6, paddingLeft: 14 }}>
            КАТЕГОРИИ
          </div>

          {CATEGORIES.map(c => {
            const active = activeView === 'feed' && activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setActiveView('feed'); setMobileMenuOpen(false); }}
                style={{
                  background: active ? '#FFF0EC' : 'transparent',
                  border: 'none', borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  color: active ? '#C04400' : '#555',
                  width: '100%', textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EB'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <CategoryIcon id={c.id} size={18} />
                {c.label}
              </button>
            );
          })}

          {isLoggedIn && (
            <>
              <div style={{ height: 1, background: '#EDE5D8', margin: '12px 4px' }} />
              <div style={{ fontSize: 11, fontWeight: 900, color: '#C4B5A0', letterSpacing: 1.2, marginBottom: 6, paddingLeft: 14 }}>
                МОЈОТ ПРОФИЛ
              </div>

              {/* Пораки */}
              {(() => {
                const unreadCount = Object.entries(conversations).filter(
                  ([id, { msgs }]) => !readConversationIds.has(id) && msgs.some(m => !m.isOwn)
                ).length;
                const active = activeView === 'messages';
                return (
                  <button
                    onClick={() => { setMobileMenuOpen(false); router.push('/messages'); }}
                    style={{
                      background: active ? '#FFF0EC' : 'transparent',
                      border: 'none', borderRadius: 14, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      color: active ? '#C04400' : '#555', width: '100%', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EB'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = active ? '#FFF0EC' : 'transparent'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}><ChatBubbleIcon size={17} /></span>
                    Пораки
                    {unreadCount > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#FF6B4A', color: 'white', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                );
              })()}

              {navItems.map(item => {
                const active = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => { setActiveView(item.view); setMobileMenuOpen(false); }}
                    style={{
                      background: active ? '#FFF0EC' : 'transparent',
                      border: 'none', borderRadius: 14, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      color: active ? '#C04400' : '#555',
                      width: '100%', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EB'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    {item.label}
                    {item.view === 'interests' && interestedIds.size > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#FF6B4A', color: 'white', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                        {interestedIds.size}
                      </span>
                    )}
                    {item.view === 'my-donations' && myDonations.length > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#1A1A2E', color: 'white', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                        {myDonations.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main id="main-content" style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>

          {/* FEED VIEW */}
          {activeView === 'feed' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>
                    {activeCat === 'Сите' ? 'Сите донации' : activeCat}
                  </h1>
                  <div style={{ fontSize: 14, color: '#aaa', fontWeight: 700, marginTop: 4 }}>
                    {filtered.length} предмет{filtered.length === 1 ? '' : 'и'} достапн{filtered.length === 1 ? '' : 'и'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {/* Search */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'white', borderRadius: 50, padding: '8px 20px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.07)', minWidth: 220,
                    border: '2px solid transparent',
                  }}>
                    <span style={{ color: '#C4B5A0' }}><SearchIcon size={16} /></span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пребарај..."
                      style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, background: 'transparent', width: '100%', color: '#1A1A2E' }} />
                  </div>

                  {/* City filter */}
                  <FilterCityDropdown value={cityFilter} onChange={setCityFilter} />

                  {/* Date filter */}
                  <DateFilterDropdown value={dateFilter} onChange={setDateFilter} />
                </div>
              </div>

              {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }} aria-label="Се вчитува..." aria-busy="true">
                  {Array.from({ length: 6 }).map((_, i) => <DonationCardSkeleton key={i} />)}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {filtered.map(item => (
                      <DonationCard key={item.id} item={item}
                        onClick={() => setSelected(item)}
                        onInterest={() => isLoggedIn ? handleInterest(item.id) : (setAuthDefaultTab('login'), setModal('auth'))}
                        isLoggedIn={isLoggedIn}
                        isInterested={interestedIds.has(item.id)}
                        interestDisabled={pendingInterestIds.has(item.id)}
                        isOwn={item.userId === userId}
                      />
                    ))}
                  </div>
                  {filtered.length === 0 && <EmptyState icon={<SearchIcon size={64} />} title="Нема резултати" sub="Обиди се со друго пребарување" />}
                </>
              )}
            </>
          )}

          {/* INTERESTS VIEW */}
          {activeView === 'interests' && (
            <>
              <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}><HeartIcon size={24} /> Мои интереси</h1>
              {interestedItems.length === 0
                ? <EmptyState icon={<HeartIcon size={64} />} title="Сè уште нема интереси" sub="Кликни 'Интерес' на некој предмет за да го зачуваш овде" />

                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {interestedItems.map(item => (
                      <DonationCard key={item.id} item={item}
                        onClick={() => setSelected(item)}
                        onInterest={() => handleInterest(item.id)}
                        isLoggedIn={isLoggedIn}
                        isInterested={true}
                        interestDisabled={pendingInterestIds.has(item.id)}
                        isOwn={item.userId === userId}
                      />
                    ))}
                  </div>
                )
              }
            </>
          )}

          {/* MY DONATIONS VIEW */}
          {activeView === 'my-donations' && (
            <>
              <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}><GiftIcon size={24} /> Мои донации</h1>
              {myDonations.length === 0
                ? <EmptyState icon={<GiftIcon size={64} />} title="Сè уште немаш донации" sub="Додај прв предмет и помогни некому!" />
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {myDonations.map(item => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        <DonationCard item={item}
                          onClick={() => setSelected(item)}
                          onInterest={() => {}}
                          isLoggedIn={false}
                          isInterested={false}
                          isOwn={true}
                        />
                        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
                          <button
                            onClick={e => { e.stopPropagation(); setEditItem(item); }}
                            title="Уреди"
                            style={{ width: 34, height: 34, background: 'white', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >✏️</button>
                          <button
                            onClick={e => { e.stopPropagation(); if (confirm('Избриши ја оваа донација?')) handleDelete(item.id); }}
                            title="Избриши"
                            style={{ width: 34, height: 34, background: 'white', border: 'none', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </>
          )}

          {/* MESSAGES VIEW */}
          {activeView === 'messages' && (
            <>
              <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 8 }}><ChatBubbleIcon size={24} /> Пораки</h1>
              {Object.values(conversations).length === 0 ? (
                <EmptyState icon={<ChatBubbleIcon size={64} />} title="Немаш активни разговори" sub={'Отвори некој предмет и кликни „Контактирај"'} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
                  {Object.values(conversations)
                    .sort((a, b) => new Date(b.lastMsgAt).getTime() - new Date(a.lastMsgAt).getTime())
                    .map(({ item, msgs }) => {
                    const last = msgs[msgs.length - 1];
                    return (
                      <div
                        key={item.id}
                        onClick={() => setOpenMessageItemId(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpenMessageItemId(item.id); }}
                        style={{
                          background: 'white', borderRadius: 20, padding: '14px 18px',
                          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
                      >
                        <div style={{ width: 54, height: 54, borderRadius: 16, background: item.cardColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          {item.image
                            ? <Image src={item.image} alt={item.title} fill style={{ objectFit: 'cover' }} unoptimized={item.image.startsWith('data:')} />
                            : item.emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontWeight: 900, fontSize: 15, color: '#1A1A2E' }}>{item.donorName}</span>
                            {last && <span style={{ fontSize: 12, color: '#bbb', fontWeight: 700 }}>{last.time}</span>}
                          </div>
                          <div style={{ fontSize: 12, color: '#aaa', fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                          {last && (
                            <div style={{ fontSize: 13, color: '#777', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {last.isOwn ? 'Јас: ' : ''}{last.text}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={async e => {
                            e.stopPropagation();
                            // Delete messages I sent
                            await supabase.from('messages').delete().eq('donation_id', item.id).eq('sender_id', userId!);
                            // If I own the donation, also delete received messages
                            if (item.userId === userId) {
                              await supabase.from('messages').delete().eq('donation_id', item.id);
                            }
                            setConversations(prev => { const n = { ...prev }; delete n[item.id]; return n; });
                          }}
                          aria-label="Избриши разговор"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ddd', padding: '4px', flexShrink: 0, borderRadius: 8, transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                          onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
                        >🗑️</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* ── OVERLAYS ── */}

      {/* Open conversation overlay */}
      {activeView === 'messages' && openMessageItemId && conversations[openMessageItemId] && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: '#FFF9F0', fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}>
          <ChatScreen
            item={conversations[openMessageItemId].item}
            userId={userId}
            userName={userName}
            onBack={() => { setOpenMessageItemId(null); loadConversations(userId!); }}
          />
        </div>
      )}
      {selected && (
        <DetailModal
          item={donations.find(d => d.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onInterest={() => isLoggedIn ? handleInterest(selected.id) : (setAuthDefaultTab('login'), setModal('auth'))}
          isLoggedIn={isLoggedIn}
          isInterested={interestedIds.has(selected.id)}
          interestDisabled={pendingInterestIds.has(selected.id)}
          onAuthRequired={() => { setAuthDefaultTab('login'); setModal('auth'); }}
          onCreateProfile={() => { setSelected(null); setAuthDefaultTab('reg'); setModal('auth'); }}
          userId={userId}
          userName={userName}
        />
      )}
      {modal === 'post' && <PostModal onClose={() => setModal(null)} onSubmit={handlePostSubmit} />}
      {editItem && <EditDonationModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEditSave} />}
      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} onSubmit={handleAuthSubmit} onForgotPassword={handleForgotPassword} defaultTab={authDefaultTab} />}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" style={{ background: 'white', borderRadius: 24, padding: '32px 28px', width: 'min(400px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', animation: 'scaleIn 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/>
                <path d="M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </div>
            <div id="delete-account-title" style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E', textAlign: 'center', marginBottom: 10 }}>
              Избриши акаунт
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#888', textAlign: 'center', marginBottom: 28, lineHeight: 1.6 }}>
              Акаунтот ќе биде трајно избришан заедно со сите твои донации и пораки. Оваа акција не може да се поништи.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={deleteLoading}
                style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 800, cursor: 'pointer', color: '#555' }}
              >
                Откажи
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                style={{ flex: 1, background: '#E74C3C', border: 'none', borderRadius: 50, padding: '14px', fontSize: 14, fontWeight: 900, cursor: 'pointer', color: 'white', opacity: deleteLoading ? 0.7 : 1 }}
              >
                {deleteLoading ? 'Момент...' : 'Да, избриши'}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
