'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { DonationItem, ChatMessage } from '@/types';

function ArrowUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="19" x2="12" y2="5"/>
      <polyline points="5 12 12 5 19 12"/>
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  );
}

interface ChatScreenProps {
  item: DonationItem;
  userId: string | null;
  userName: string;
  onBack: () => void;
}

export default function ChatScreen({ item, userId, userName, onBack }: ChatScreenProps) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(!!userId);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing messages from DB
  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    (async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('donation_id', item.id)
          .order('created_at', { ascending: true });
        if (data) {
          setMsgs(data.map((m: any) => ({
            id: m.id,
            sender: m.sender_name,
            text: m.text,
            isOwn: m.sender_id === userId,
            time: new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          })));
        }
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, userId]);

  // Realtime subscription for new messages in this conversation
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`chat-${item.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `donation_id=eq.${item.id}`,
      }, (payload) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const m = payload.new as any;
        const incoming: ChatMessage = {
          id: m.id,
          sender: m.sender_name,
          text: m.text,
          isOwn: m.sender_id === userId,
          time: new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        };
        setMsgs(prev => {
          // Replace matching optimistic temp message
          const tempIdx = prev.findIndex(p =>
            p.id.startsWith('temp-') && p.text === incoming.text && p.isOwn === incoming.isOwn
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = incoming;
            return next;
          }
          // Avoid pure duplicates
          if (prev.some(p => p.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs.length]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(t);
  }, []);

  const send = async () => {
    if (!input.trim()) return;
    const text = input.trim();
    const time = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    if (!userId) {
      // Guest: show locally only
      setMsgs(prev => [...prev, { id: 'local-' + Date.now(), sender: userName, text, isOwn: true, time }]);
      setInput('');
      return;
    }

    // Optimistic: add temp message; realtime will replace it with the confirmed one
    const tempId = 'temp-' + Date.now();
    setMsgs(prev => [...prev, { id: tempId, sender: userName, text, isOwn: true, time }]);
    setInput('');

    await supabase.from('messages').insert({
      donation_id: item.id,
      participant_id: userId,
      sender_id: userId,
      sender_name: userName,
      text,
    });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#FFF9F0',
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: '14px 20px',
        background: 'white',
        borderBottom: '1px solid #F0EBE0',
        display: 'flex', alignItems: 'center', gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={onBack}
          aria-label="Назад"
          style={{
            background: '#F5F3FF', border: 'none', borderRadius: 50,
            width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#7B4FFF', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#EDE5FF')}
          onMouseLeave={e => (e.currentTarget.style.background = '#F5F3FF')}
        >
          <ArrowLeftIcon />
        </button>

        {/* Donor avatar with online dot */}
        <div style={{
          width: 42, height: 42, borderRadius: 50,
          background: item.cardColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, flexShrink: 0, position: 'relative',
        }}>
          <span>{item.emoji}</span>
          <div style={{
            position: 'absolute', bottom: 1, right: 1,
            width: 10, height: 10, borderRadius: 50,
            background: '#22C55E', border: '2px solid white',
          }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#1A1A2E', lineHeight: 1.2 }}>
            {item.donorName}
          </div>
          <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>● Онлајн</div>
        </div>

        {/* Item thumbnail + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, maxWidth: 160 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, overflow: 'hidden',
            background: item.cardColor, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, position: 'relative',
          }}>
            {item.image ? (
              <Image
                src={item.image} alt={item.title} fill
                style={{ objectFit: 'cover' }}
                unoptimized={item.image.startsWith('data:')}
              />
            ) : (
              <span>{item.emoji}</span>
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 800, color: '#1A1A2E',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {item.title}
            </div>
            <div style={{ fontSize: 11, color: '#bbb', fontWeight: 700 }}>{item.category}</div>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 13, color: '#bbb', fontWeight: 700 }}>Се вчитува...</div>
          </div>
        ) : msgs.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '40px 24px',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{item.emoji}</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#1A1A2E', marginBottom: 6 }}>
              Започни разговор
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#bbb' }}>
              Испрати порака на {item.donorName}
            </div>
          </div>
        ) : (
          <>
            <div style={{
              textAlign: 'center', fontSize: 11, color: '#bbb', fontWeight: 700,
              marginBottom: 10,
              background: 'rgba(0,0,0,0.04)', borderRadius: 50,
              padding: '4px 14px', alignSelf: 'center',
            }}>
              Денес
            </div>

            {msgs.map((m, i) => {
              const showAvatar = !m.isOwn && (i === 0 || msgs[i - 1].isOwn);
              return (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: m.isOwn ? 'flex-end' : 'flex-start',
                    alignItems: 'flex-end', gap: 8,
                    marginBottom: 2,
                  }}
                >
                  {!m.isOwn && (
                    <div style={{
                      width: 28, height: 28, borderRadius: 50,
                      background: showAvatar ? item.cardColor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, flexShrink: 0,
                    }}>
                      {showAvatar && item.emoji}
                    </div>
                  )}

                  <div style={{
                    background: m.isOwn ? '#FF6B4A' : 'white',
                    color: m.isOwn ? 'white' : '#1A1A2E',
                    borderRadius: m.isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 14px',
                    maxWidth: '68%',
                    fontSize: 14, fontWeight: 600,
                    boxShadow: m.isOwn
                      ? '0 2px 10px rgba(255,107,74,0.28)'
                      : '0 2px 8px rgba(0,0,0,0.07)',
                    lineHeight: 1.5,
                  }}>
                    {m.text}
                    <div style={{
                      fontSize: 10, marginTop: 3, opacity: 0.65,
                      textAlign: m.isOwn ? 'right' : 'left',
                      fontWeight: 700,
                    }}>
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={endRef} />
          </>
        )}
      </div>

      {/* ── Input bar ── */}
      <div style={{
        padding: '12px 16px 16px',
        background: '#F5F3FF',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
        borderTop: '1px solid rgba(123,79,255,0.1)',
      }}>
        <label htmlFor="chat-msg-input" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
          Напиши порака
        </label>
        <input
          id="chat-msg-input"
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Напиши порака..."
          autoComplete="off"
          style={{
            flex: 1,
            border: '2px solid rgba(123,79,255,0.15)',
            borderRadius: 50,
            padding: '12px 20px',
            fontSize: 14, fontWeight: 600,
            background: 'white', outline: 'none',
            color: '#1A1A2E',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,79,255,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,79,255,0.15)')}
        />
        <button
          onClick={send}
          aria-label="Испрати"
          style={{
            background: '#FF6B4A', border: 'none', borderRadius: 50,
            width: 44, height: 44, cursor: 'pointer', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 12px rgba(255,107,74,0.4)',
            transition: 'opacity 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.87'; e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </div>
  );
}
