'use client';

import { useState, useEffect, useRef } from 'react';
import { DonationItem, ChatMessage } from '@/types';
import { SEED_DONATIONS, CATEGORIES, POST_CATEGORIES, CATEGORY_COLORS, MK_CITIES } from '@/data/donations';

type ActiveView = 'feed' | 'interests' | 'my-donations' | 'chats';

const formatDate = (iso?: string, fallback?: string): string => {
  if (!iso) {
    if (!fallback || fallback === 'само сега') return 'Денес';
    return fallback;
  }
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' });
  const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return `Денес ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Вчера ${time}`;
  return d.toLocaleDateString('mk-MK');
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{
      position: 'fixed', bottom: 36, left: '50%',
      animation: 'slideUpFade 0.3s ease forwards',
      background: '#1A1A2E', color: 'white', padding: '14px 28px',
      borderRadius: 50, fontSize: 15, fontWeight: 800, zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.22)', whiteSpace: 'nowrap',
    }}>
      {message}
    </div>
  );
}

// ─── CONDITION BADGE ──────────────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition: string }) {
  const map: Record<string, { bg: string; color: string; icon: string }> = {
    'Одлична': { bg: '#E8F8F5', color: '#1ABC9C', icon: '⭐' },
    'Добра':   { bg: '#EBF5FB', color: '#2E86C1', icon: '👍' },
    'Солидна': { bg: '#FEF9E7', color: '#E67E22', icon: '👌' },
  };
  const s = map[condition] || { bg: '#f0f0f0', color: '#888', icon: '•' };
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: 50, padding: '5px 12px',
      fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span>{s.icon}</span>
      <span>Состојба: {condition}</span>
    </span>
  );
}

// ─── INTEREST BUTTON ──────────────────────────────────────────────────────────
function InterestButton({ isInterested, onClick, size = 'sm' }: {
  isInterested: boolean;
  onClick: (e: React.MouseEvent) => void;
  size?: 'sm' | 'lg';
}) {
  const sm = size === 'sm';
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(e); }}
      style={{
        background: isInterested ? '#6340CC' : '#7B4FFF',
        color: 'white',
        border: 'none',
        borderRadius: 9999,
        padding: sm ? '7px 14px' : '14px 24px',
        fontSize: sm ? 13 : 15,
        fontWeight: 800,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        whiteSpace: 'nowrap',
        width: sm ? undefined : '100%',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#6340CC')}
      onMouseLeave={e => (e.currentTarget.style.background = isInterested ? '#6340CC' : '#7B4FFF')}
    >
      {isInterested ? '❤️' : '🤍'} Интерес
    </button>
  );
}

// ─── DONATION CARD ────────────────────────────────────────────────────────────
function DonationCard({ item, onClick, onInterest, isLoggedIn, isInterested }: {
  item: DonationItem;
  onClick: () => void;
  onInterest: (e: React.MouseEvent) => void;
  isLoggedIn: boolean;
  isInterested: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
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
          ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : item.emoji}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          background: 'white', borderRadius: 50, padding: '4px 12px',
          fontSize: 13, fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 4,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}>
          <span style={{ color: '#E74C3C' }}>❤️</span>
          {item.interestedCount}
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontWeight: 900, fontSize: 17, marginBottom: 4, color: '#1A1A2E', lineHeight: 1.3 }}>
          {item.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <ConditionBadge condition={item.condition} />
          {(item.createdAtISO || item.createdAt) && (
            <span style={{ fontSize: 12, fontWeight: 700, color: '#bbb', display: 'flex', alignItems: 'center', gap: 4 }}>
              📅 {formatDate(item.createdAtISO, item.createdAt)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#666', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
              👤 {item.donorName}
            </span>
            <span style={{
              background: '#F5F5F5', borderRadius: 50, padding: '4px 10px',
              fontSize: 12, fontWeight: 700, color: '#888',
              display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap',
            }}>
              📍 {item.location}
            </span>
          </div>

          {isLoggedIn && (
            <InterestButton isInterested={isInterested} onClick={onInterest} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, onInterest, isLoggedIn, onAuthRequired, isInterested, msgs, onSendMessage }: {
  item: DonationItem;
  onClose: () => void;
  onInterest: () => void;
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  isInterested: boolean;
  msgs: ChatMessage[];
  onSendMessage: (text: string) => void;
}) {
  const [chatOpen, setChatOpen] = useState(msgs.length > 0);
  const allImages = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  const [activeImg, setActiveImg] = useState(0);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // open chat if messages arrive (e.g. donor reply)
  useEffect(() => {
    if (msgs.length > 0) setChatOpen(true);
  }, [msgs.length]);

  // lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const openChat = () => {
    setChatOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const send = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 200, backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 28,
          width: 'min(560px, 100%)', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          animation: 'scaleIn 0.22s ease',
          overflow: 'hidden',
        }}
      >
        {/* Full-width hero image */}
        <div style={{
          background: item.cardColor, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ height: 220, position: 'relative', fontSize: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {allImages.length > 0
              ? <img src={allImages[activeImg]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              : item.emoji}
          </div>
          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'rgba(0,0,0,0.25)', overflowX: 'auto' }}>
              {allImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 52, height: 52, objectFit: 'cover', borderRadius: 10, flexShrink: 0,
                    cursor: 'pointer', border: activeImg === i ? '2px solid white' : '2px solid transparent',
                    opacity: activeImg === i ? 1 : 0.65, transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 14, right: 14,
              background: 'white', border: 'none', borderRadius: 50,
              width: 38, height: 38, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, color: '#666', fontWeight: 900,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >✕</button>

          {/* Category chip */}
          <div style={{
            position: 'absolute', top: 14, left: 14,
            background: 'white', borderRadius: 50,
            padding: '5px 14px', fontSize: 12, fontWeight: 800,
            color: item.accentColor,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {item.category}
          </div>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px 0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>{item.title}</h2>
            <ConditionBadge condition={item.condition} />
          </div>

          <p style={{ fontSize: 14, color: '#777', lineHeight: 1.65, marginBottom: 20, fontWeight: 700 }}>
            {item.description}
          </p>

          {/* Info rows */}
          <div style={{
            background: '#F5F0FF', borderRadius: 16, padding: '16px',
            marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 12,
          }}>
            {[
              { icon: '👤', label: 'Донатор',        value: item.donorName },
              { icon: '📍', label: 'Локација',        value: item.location },
              { icon: '❤️', label: 'Заинтересирани', value: `${item.interestedCount} луѓе` },
              { icon: '📅', label: 'Постирано',       value: formatDate(item.createdAtISO, item.createdAt) },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#999', fontWeight: 700 }}>{r.icon} {r.label}</span>
                <span style={{ fontSize: 13, fontWeight: 900, color: '#1A1A2E' }}>{r.value}</span>
              </div>
            ))}
          </div>

          {/* Chat — shown only when open */}
          {chatOpen && isLoggedIn && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 900, fontSize: 14, color: '#FF6B4A', marginBottom: 12 }}>
                💬 Разговор со донаторот
              </div>
              <div style={{
                background: '#FFF9F0', borderRadius: 14, padding: '14px',
                display: 'flex', flexDirection: 'column', gap: 10,
                maxHeight: 200, overflowY: 'auto', marginBottom: 10,
              }}>
                {msgs.length === 0 && (
                  <div style={{ textAlign: 'center', color: '#ccc', fontSize: 13, fontWeight: 700, padding: '12px 0' }}>
                    Започни го разговорот 👋
                  </div>
                )}
                {msgs.map(m => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.isOwn ? 'flex-end' : 'flex-start' }}>
                    {!m.isOwn && (
                      <div style={{
                        width: 28, height: 28, borderRadius: 50, background: item.cardColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, marginRight: 8, flexShrink: 0, alignSelf: 'flex-end',
                      }}>{item.emoji}</div>
                    )}
                    <div style={{
                      background: m.isOwn ? '#FF6B4A' : 'white',
                      color: m.isOwn ? 'white' : '#1A1A2E',
                      borderRadius: m.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      padding: '9px 14px', maxWidth: '75%',
                      fontSize: 13, fontWeight: 700,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.07)',
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  ref={inputRef}
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Напиши порака..."
                  style={{
                    flex: 1, border: '2px solid #EDE5D8', borderRadius: 50,
                    padding: '10px 18px', fontSize: 13, fontWeight: 700,
                    background: 'white', outline: 'none',
                  }}
                />
                <button onClick={send} style={{
                  background: '#FF6B4A', border: 'none', borderRadius: 50,
                  width: 42, height: 42, cursor: 'pointer', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>↑</button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid #F0EBE0', flexShrink: 0 }}>
          {!isLoggedIn ? (
            <button
              onClick={onAuthRequired}
              style={{
                width: '100%', background: '#1A1A2E', color: 'white',
                border: 'none', borderRadius: 50, padding: '16px',
                fontSize: 17, fontWeight: 900, cursor: 'pointer',
              }}
            >
              🔐 Логирај се за да контактираш
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              {/* Primary */}
              <button
                onClick={openChat}
                style={{
                  flex: 2, background: '#FF6B4A', color: 'white',
                  border: 'none', borderRadius: 50, padding: '16px',
                  fontSize: 16, fontWeight: 900, cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                💬 Контактирај
              </button>

              {/* Secondary */}
              <div style={{ flex: 1 }}>
                <InterestButton isInterested={isInterested} onClick={onInterest} size="lg" />
              </div>
            </div>
          )}
        </div>
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
          <span>📍</span>
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
                color: value === c ? '#FF6B4A' : '#1A1A2E',
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
        <span style={{ fontSize: 16 }}>📍</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: value ? '#FF6B4A' : '#AAA', whiteSpace: 'nowrap' }}>
          {value || 'Сите општини'}
        </span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#FF6B4A', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
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
                color: value === c ? '#FF6B4A' : '#1A1A2E',
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
        <span style={{ fontSize: 16 }}>📅</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: value ? '#FF6B4A' : '#AAA', whiteSpace: 'nowrap' }}>
          {selected.label}
        </span>
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); setOpen(false); }} style={{ color: '#FF6B4A', fontSize: 16, lineHeight: 1, marginLeft: 2 }}>×</span>
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
                color: value === o.id ? '#FF6B4A' : '#1A1A2E',
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
  onSubmit: (data: Partial<DonationItem>) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const tryAdvance = () => {
    if (!canAdvance()) {
      if (step === 1) setError('Додај барем една фотографија за да продолжиш.');
      else if (step === 2) setError('Пополни ги сите полиња и избери категорија.');
      else if (step === 3) setError('Внеси локација и избери состојба на предметот.');
      return;
    }
    setError('');
    if (step < 3) setStep(s => s + 1);
    else submit();
  };

  const submit = () => {
    const colors = CATEGORY_COLORS[cat] || { card: '#F5F5F5', accent: '#888' };
    const emoji = POST_CATEGORIES.find(c => c.id === cat)?.emoji || '🎁';
    onSubmit({ title, description: desc, category: cat, condition: cond as DonationItem['condition'], location: loc, emoji, cardColor: colors.card, accentColor: colors.accent, image: photos[0], images: photos });
  };

  const stepTitles = ['Додај фотографии', 'Детали за предметот', 'Локација и состојба'];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{
        animation: 'scaleIn 0.22s ease',
        background: 'white', borderRadius: 28, padding: '32px',
        width: 'min(560px, 100%)', zIndex: 301,
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E' }}>{stepTitles[step - 1]}</div>
            <div style={{ fontSize: 14, color: '#aaa', fontWeight: 700, marginTop: 4 }}>Чекор {step} од 3</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa', lineHeight: 1 }}>✕</button>
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
                      style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>
                      ✕
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
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 14, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>
            ⚠️ {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          {step > 1 && (
            <button onClick={() => { setStep(s => s - 1); setError(''); }}
              style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 50, padding: '16px', fontSize: 15, fontWeight: 800, cursor: 'pointer', color: '#555' }}>
              ← Назад
            </button>
          )}
          <button onClick={tryAdvance}
            style={{ flex: 2, background: '#FF6B4A', border: 'none', borderRadius: 50, padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', color: 'white', transition: 'opacity 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {step === 3 ? '🎉 Објави!' : 'Следно →'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }: { onClose: () => void; onLogin: (name: string) => void }) {
  const [tab, setTab] = useState<'reg' | 'login'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim());

  const submit = () => {
    if (tab === 'reg') {
      if (!validEmail(email)) {
        setEmailError('Внеси валидна е-мејл адреса');
        return;
      }
      if (pass !== confirmPass) {
        setPassError('Лозинките не се совпаѓаат');
        return;
      }
    }
    setEmailError('');
    setPassError('');
    const n = name || email.split('@')[0] || 'Корисник';
    onLogin(n);
    onClose();
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '2px solid #EDE5D8', borderRadius: 16,
    padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none',
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{
        animation: 'scaleIn 0.22s ease',
        background: 'white', borderRadius: 28, padding: '32px',
        width: 'min(440px, 100%)', zIndex: 301,
        boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 22 }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>{tab === 'login' ? '🔑 Најави се' : '👋 Регистрирај се'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        <div style={{ display: 'flex', background: '#F5F5F5', borderRadius: 50, padding: 4, marginBottom: 22 }}>
          {(['login','reg'] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setPassError(''); setName(''); setEmail(''); setPass(''); setConfirmPass(''); }} style={{
              flex: 1, background: tab === t ? '#1A1A2E' : 'transparent',
              color: tab === t ? 'white' : '#888',
              border: 'none', borderRadius: 50, padding: '10px',
              fontSize: 14, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
            }}>{t === 'reg' ? 'Регистрација' : 'Најава'}</button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tab === 'reg' && <input value={name} onChange={e => setName(e.target.value)} placeholder="Вашето ime" style={inputStyle} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <input
              value={email}
              onChange={e => { setEmail(e.target.value); setEmailError(''); }}
              placeholder="Е-мејл"
              type="email"
              style={{ ...inputStyle, borderColor: emailError ? '#E74C3C' : '#EDE5D8' }}
            />
            {emailError && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>
                ⚠️ {emailError}
              </div>
            )}
          </div>
          <input value={pass} onChange={e => { setPass(e.target.value); setPassError(''); }} placeholder="Лозинка" type="password" style={inputStyle} />
          {tab === 'reg' && (
            <>
              <input
                value={confirmPass}
                onChange={e => { setConfirmPass(e.target.value); setPassError(''); }}
                placeholder="Потврди лозинка"
                type="password"
                style={{ ...inputStyle, borderColor: passError ? '#E74C3C' : '#EDE5D8' }}
              />
              {passError && (
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', marginTop: -4, paddingLeft: 4 }}>
                  ⚠️ {passError}
                </div>
              )}
            </>
          )}
        </div>

        <button onClick={submit} style={{
          width: '100%', background: '#FF6B4A', border: 'none', borderRadius: 50,
          padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', color: 'white', marginTop: 16,
        }}>{tab === 'reg' ? 'Регистрирај се' : 'Најави се'}</button>
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ animation: 'scaleIn 0.22s ease', background: 'white', borderRadius: 28, padding: '32px', width: 'min(560px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E' }}>✏️ Уреди донација</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#aaa' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Photo upload */}
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => readFiles(e.target.files)} />
          <div style={{ fontSize: 12, fontWeight: 900, color: '#bbb', letterSpacing: 1 }}>ФОТОГРАФИИ</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {photos.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', background: '#eee' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))} style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}>✕</button>
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
            <div style={{ padding: '10px 14px', background: '#FFF0EE', border: '1.5px solid #E74C3C', borderRadius: 12, fontSize: 13, fontWeight: 700, color: '#C0392B' }}>
              ⚠️ {error}
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
function EmptyState({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{emoji}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: '#555' }}>{title}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginTop: 8 }}>{sub}</div>
    </div>
  );
}

// ─── CHATS VIEW ───────────────────────────────────────────────────────────────
type Conversation = { item: DonationItem; msgs: ChatMessage[] };

function ChatsView({ conversations, onOpen, onDelete }: {
  conversations: Record<string, Conversation>;
  onOpen: (item: DonationItem) => void;
  onDelete: (itemId: string) => void;
}) {
  const list = Object.values(conversations);

  if (list.length === 0) {
    return (
      <div style={{ width: '100%' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 900 }}>💬 Чатови</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>💬</div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#555' }}>Нема активни чатови</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginTop: 8 }}>
            Отвори некој предмет и кликни „Контактирај"
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ margin: '0 0 20px', fontSize: 22, fontWeight: 900 }}>💬 Чатови</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {list.map(({ item, msgs }) => {
          const last = msgs[msgs.length - 1];
          const unread = msgs.filter(m => !m.isOwn).length;
          return (
            <div
              key={item.id}
              onClick={() => onOpen(item)}
              style={{
                background: 'white', borderRadius: 20, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16, background: item.cardColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26, flexShrink: 0,
              }}>{item.emoji}</div>
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
              {unread > 0 && (
                <div style={{
                  background: '#FF6B4A', color: 'white', borderRadius: 50,
                  width: 22, height: 22, fontSize: 11, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>{unread}</div>
              )}
              <button
                onClick={e => { e.stopPropagation(); onDelete(item.id); }}
                title="Избриши чат"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#ddd', padding: '4px', flexShrink: 0, lineHeight: 1 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
              >🗑️</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [donations, setDonations] = useState<DonationItem[]>(SEED_DONATIONS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('dk_donations');
      if (saved) setDonations(JSON.parse(saved));
    } catch {}
  }, []);

  const saveDonations = (items: DonationItem[]) => {
    setDonations(items);
    try { localStorage.setItem('dk_donations', JSON.stringify(items)); } catch {}
  };
  const [activeCat, setActiveCat] = useState('Сите');
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selected, setSelected] = useState<DonationItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [modal, setModal] = useState<null | 'post' | 'auth'>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    try {
      const logged = localStorage.getItem('dk_logged') === '1';
      const user = localStorage.getItem('dk_user') || '';
      if (logged) { setIsLoggedIn(true); setUserName(user); }
    } catch {}
  }, []);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [myDonationIds, setMyDonationIds] = useState<string[]>([]);
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});

  useEffect(() => {
    try {
      const ids = localStorage.getItem('dk_interests');
      if (ids) setInterestedIds(new Set(JSON.parse(ids)));
      const mine = localStorage.getItem('dk_mydonations');
      if (mine) setMyDonationIds(JSON.parse(mine));
      const convs = localStorage.getItem('dk_conversations');
      if (convs) setConversations(JSON.parse(convs));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem('dk_interests', JSON.stringify([...interestedIds])); } catch {}
  }, [interestedIds]);

  useEffect(() => {
    try { localStorage.setItem('dk_mydonations', JSON.stringify(myDonationIds)); } catch {}
  }, [myDonationIds]);

  useEffect(() => {
    try { localStorage.setItem('dk_conversations', JSON.stringify(conversations)); } catch {}
  }, [conversations]);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editItem, setEditItem] = useState<DonationItem | null>(null);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarOpen) return;
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [avatarOpen]);

  const showToast = (msg: string) => setToast(msg);

  const handleInterest = (itemId: string) => {
    const adding = !interestedIds.has(itemId);
    setInterestedIds(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
    showToast(adding ? '🎉 Донаторот е известен!' : '💔 Интересот е отстранет');
    saveDonations(donations.map(d =>
      d.id === itemId ? { ...d, interestedCount: d.interestedCount + (adding ? 1 : -1) } : d
    ));
  };

  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

  const handleSendMessage = (item: DonationItem, text: string) => {
    const time = new Date().toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: uid(), sender: userName, text, isOwn: true, time };
    const isFirstMessage = !conversations[item.id] || conversations[item.id].msgs.filter(m => !m.isOwn).length === 0;
    setConversations(prev => {
      const existing = prev[item.id] ?? { item, msgs: [] };
      return { ...prev, [item.id]: { item, msgs: [...existing.msgs, userMsg] } };
    });
    if (isFirstMessage) {
      const replyTime = new Date().toLocaleTimeString('mk-MK', { hour: '2-digit', minute: '2-digit' });
      const reply: ChatMessage = {
        id: uid(), sender: item.donorName,
        text: 'Здраво! Да, предметот е уште достапен. Кога ти одговара да се сретнеме? 😊',
        isOwn: false, time: replyTime,
      };
      setTimeout(() => {
        setConversations(p => {
          const c = p[item.id];
          if (!c) return p;
          return { ...p, [item.id]: { ...c, msgs: [...c.msgs, reply] } };
        });
      }, 1400);
    }
  };

  const handleAddClick = () => {
    if (!isLoggedIn) setModal('auth');
    else setModal('post');
  };

  const handleLogin = (name: string) => {
    setIsLoggedIn(true);
    setUserName(name);
    try { localStorage.setItem('dk_logged', '1'); localStorage.setItem('dk_user', name); } catch {}
    showToast(`🎉 Добредојде, ${name}!`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setActiveView('feed');
    setAvatarOpen(false);
    try {
      localStorage.removeItem('dk_logged');
      localStorage.removeItem('dk_user');
    } catch {}
    showToast('👋 Се одјавивте успешно.');
  };

  const handleEditSave = (updated: DonationItem) => {
    const updatedList = donations.map(d => d.id === updated.id ? updated : d);
    saveDonations(updatedList);
    setEditItem(null);
    showToast('✅ Донацијата е ажурирана!');
  };

  const handleDelete = (itemId: string) => {
    saveDonations(donations.filter(d => d.id !== itemId));
    setMyDonationIds(prev => prev.filter(id => id !== itemId));
    showToast('🗑️ Донацијата е избришана.');
  };

  const handlePostSubmit = (data: Partial<DonationItem>) => {
    const newItem: DonationItem = {
      id: Date.now().toString(),
      title: data.title || 'Нов предмет',
      description: data.description || '',
      category: data.category || 'Облека',
      condition: (data.condition as DonationItem['condition']) || 'Добра',
      location: data.location || 'Скопје',
      donorName: userName,
      donorAvatar: userName.slice(0, 2).toUpperCase(),
      image: data.image,
      images: data.images,
      emoji: data.emoji || '🎁',
      cardColor: data.cardColor || '#F5F5F5',
      accentColor: data.accentColor || '#888',
      createdAt: new Date().toLocaleDateString('mk-MK'),
      createdAtISO: new Date().toISOString(),
      interestedCount: 0,
    };
    saveDonations([newItem, ...donations]);
    setMyDonationIds(p => [newItem.id, ...p]);
    setModal(null);
    showToast('🎉 Донацијата е објавена!');
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
  const myDonations = donations.filter(d => myDonationIds.includes(d.id));

  const navItems: { view: ActiveView; emoji: string; label: string }[] = [
    { view: 'chats',        emoji: '💬', label: 'Чатови' },
    { view: 'interests',    emoji: '❤️', label: 'Мои интереси' },
    { view: 'my-donations', emoji: '🎁', label: 'Мои донации' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', fontFamily: "var(--font-nunito), 'Nunito', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,249,240,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div
          onClick={() => setActiveView('feed')}
          style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', letterSpacing: -0.5, cursor: 'pointer' }}
        >
          Донирај<span style={{ color: '#FF6B4A' }}>.</span>мк
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleAddClick}
            style={{
              background: '#1A1A2E', color: 'white', border: 'none',
              borderRadius: 50, padding: '10px 20px', fontSize: 14,
              fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            ＋ Додај донација
          </button>

          {/* Avatar */}
          <div ref={avatarRef} style={{ position: 'relative' }}>
            <div
              onClick={() => isLoggedIn ? setAvatarOpen(o => !o) : setModal('auth')}
              style={{
                width: 40, height: 40, borderRadius: 50,
                background: isLoggedIn ? '#FF6B4A' : '#E8E0D5',
                color: isLoggedIn ? 'white' : '#888',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
                boxShadow: isLoggedIn ? '0 2px 10px rgba(255,107,74,0.35)' : 'none',
              }}
            >
              {isLoggedIn ? userName.slice(0, 2).toUpperCase() : <UserIcon />}
            </div>
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
                    🚪 Одјави се
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── BODY ── */}
      <div style={{ display: 'flex' }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 220, flexShrink: 0,
          padding: '24px 14px',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          position: 'sticky', top: 64, height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: 11, fontWeight: 900, color: '#C4B5A0', letterSpacing: 1.2, marginBottom: 6, paddingLeft: 14 }}>
            КАТЕГОРИИ
          </div>

          {CATEGORIES.map(c => {
            const active = activeView === 'feed' && activeCat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => { setActiveCat(c.id); setActiveView('feed'); }}
                style={{
                  background: active ? '#FFF0EC' : 'transparent',
                  border: 'none', borderRadius: 14, padding: '12px 14px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  fontSize: 14, fontWeight: 800, cursor: 'pointer',
                  color: active ? '#FF6B4A' : '#555',
                  width: '100%', textAlign: 'left', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EB'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 18 }}>{c.emoji}</span>
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

              {navItems.map(item => {
                const active = activeView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => setActiveView(item.view)}
                    style={{
                      background: active ? '#FFF0EC' : 'transparent',
                      border: 'none', borderRadius: 14, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 14, fontWeight: 800, cursor: 'pointer',
                      color: active ? '#FF6B4A' : '#555',
                      width: '100%', textAlign: 'left', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = '#F5F0EB'; }}
                    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                  >
                    <span style={{ fontSize: 18 }}>{item.emoji}</span>
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
                    {item.view === 'chats' && Object.keys(conversations).length > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#FF6B4A', color: 'white', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                        {Object.keys(conversations).length}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: '28px 32px', minWidth: 0 }}>

          {/* FEED VIEW */}
          {activeView === 'feed' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#1A1A2E', lineHeight: 1.2 }}>
                    {activeCat === 'Сите' ? 'Сите донации' : activeCat} 🎁
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
                    <span style={{ color: '#C4B5A0', fontSize: 16 }}>🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пребарај..."
                      style={{ border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, background: 'transparent', width: '100%', color: '#1A1A2E' }} />
                  </div>

                  {/* City filter */}
                  <FilterCityDropdown value={cityFilter} onChange={setCityFilter} />

                  {/* Date filter */}
                  <DateFilterDropdown value={dateFilter} onChange={setDateFilter} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                {filtered.map(item => (
                  <DonationCard key={item.id} item={item}
                    onClick={() => setSelected(item)}
                    onInterest={e => { e.stopPropagation(); handleInterest(item.id); }}
                    isLoggedIn={isLoggedIn && !myDonationIds.includes(item.id)}
                    isInterested={interestedIds.has(item.id)}
                  />
                ))}
              </div>

              {filtered.length === 0 && <EmptyState emoji="🔍" title="Нема резултати" sub="Обиди се со друго пребарување" />}
            </>
          )}

          {/* INTERESTS VIEW */}
          {activeView === 'interests' && (
            <>
              <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, color: '#1A1A2E' }}>❤️ Мои интереси</h1>
              {interestedItems.length === 0
                ? <EmptyState emoji="❤️" title="Сè уште нема интереси" sub="Кликни 'Интерес' на некој предмет за да го зачуваш овде" />

                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {interestedItems.map(item => (
                      <DonationCard key={item.id} item={item}
                        onClick={() => setSelected(item)}
                        onInterest={e => { e.stopPropagation(); handleInterest(item.id); }}
                        isLoggedIn={isLoggedIn}
                        isInterested={true}
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
              <h1 style={{ margin: '0 0 20px', fontSize: 26, fontWeight: 900, color: '#1A1A2E' }}>🎁 Мои донации</h1>
              {myDonations.length === 0
                ? <EmptyState emoji="🎁" title="Сè уште немаш донации" sub="Додај прв предмет и помогни некому!" />
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                    {myDonations.map(item => (
                      <div key={item.id} style={{ position: 'relative' }}>
                        <DonationCard item={item}
                          onClick={() => setSelected(item)}
                          onInterest={e => e.stopPropagation()}
                          isLoggedIn={false}
                          isInterested={false}
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

          {/* CHATS VIEW */}
          {activeView === 'chats' && (
            <ChatsView
              conversations={conversations}
              onOpen={item => setSelected(item)}
              onDelete={itemId => setConversations(prev => { const n = { ...prev }; delete n[itemId]; return n; })}
            />
          )}
        </main>
      </div>

      {/* ── OVERLAYS ── */}
      {selected && (
        <DetailModal
          item={donations.find(d => d.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onInterest={() => handleInterest(selected.id)}
          isLoggedIn={isLoggedIn}
          isInterested={interestedIds.has(selected.id)}
          onAuthRequired={() => { setSelected(null); setModal('auth'); }}
          msgs={conversations[selected.id]?.msgs ?? []}
          onSendMessage={text => handleSendMessage(selected, text)}
        />
      )}
      {modal === 'post' && <PostModal onClose={() => setModal(null)} onSubmit={handlePostSubmit} />}
      {editItem && <EditDonationModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEditSave} />}
      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} onLogin={handleLogin} />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
