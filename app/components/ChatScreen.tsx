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
  conversationId: string | null; // null = no conversation yet, created lazily on first send
  userId: string | null;
  userName: string;
  onBack: () => void;
  /** Name of the other participant — pass when known to avoid waiting for first message */
  otherPersonName?: string;
}

export default function ChatScreen({ item, conversationId: conversationIdProp, userId, userName, onBack, otherPersonName: otherPersonNameProp }: ChatScreenProps) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(!!(userId && conversationIdProp));
  // convId is null when brand-new chat; gets set on first message send
  const [convId, setConvId] = useState<string | null>(conversationIdProp);
  // Freeze the initial convId so the load effect doesn't re-run when convId changes null→uuid on first send
  const initialConvIdRef = useRef(conversationIdProp);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing messages — only once on mount (initialConvIdRef is frozen)
  useEffect(() => {
    const cid = initialConvIdRef.current;
    if (!userId || !cid) { setLoading(false); return; }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', cid)
          .order('created_at', { ascending: true });
        if (error) console.error('[ChatScreen] load error', error.message, error.code);
        setMsgs((data || []).map((m: any) => ({
          id: m.id,
          sender: m.sender_name ?? userName,
          text: m.content,
          isOwn: m.sender_id === userId,
          time: new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        })));
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Realtime subscription — subscribes once convId is known (including after lazy creation)
  useEffect(() => {
    if (!userId || !convId) return;
    const channel = supabase
      .channel(`chat-${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        const m = payload.new as any;
        const incoming: ChatMessage = {
          id: m.id,
          sender: m.sender_name ?? '',
          text: m.content,
          isOwn: m.sender_id === userId,
          time: new Date(m.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        };
        setMsgs(prev => {
          const tempIdx = prev.findIndex(p =>
            p.id.startsWith('temp-') && p.text === incoming.text && p.isOwn === incoming.isOwn
          );
          if (tempIdx !== -1) {
            const next = [...prev];
            next[tempIdx] = incoming;
            return next;
          }
          if (prev.some(p => p.id === incoming.id)) return prev;
          return [...prev, incoming];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [convId, userId]);

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
      setMsgs(prev => [...prev, { id: 'local-' + Date.now(), sender: userName, text, isOwn: true, time }]);
      setInput('');
      return;
    }

    const tempId = 'temp-' + Date.now();
    setMsgs(prev => [...prev, { id: tempId, sender: userName, text, isOwn: true, time }]);
    setInput('');

    // Lazy find-or-create conversation on the very first send
    let activeConvId = convId;
    if (!activeConvId) {
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('donation_id', item.id)
        .eq('participant_id', userId)
        .maybeSingle();
      if (existing) {
        activeConvId = existing.id;
      } else {
        const { data: created, error: createErr } = await supabase
          .from('conversations')
          .insert({ donation_id: item.id, participant_id: userId })
          .select('id')
          .single();
        if (createErr || !created) {
          console.error('[ChatScreen] create conversation error', createErr);
          setMsgs(prev => prev.map(m => m.id === tempId ? { ...m, text: m.text + ' ⚠️' } : m));
          return;
        }
        activeConvId = created.id;
      }
      setConvId(activeConvId); // triggers realtime subscription
    }

    const { data: inserted, error } = await supabase.from('messages').insert({
      conversation_id: activeConvId,
      sender_id: userId,
      sender_name: userName,
      content: text,
    }).select('id, content, created_at, sender_name').single();
    if (error) {
      console.error('[ChatScreen] send error', error);
      setMsgs(prev => prev.map(m =>
        m.id === tempId ? { ...m, text: m.text + ' ⚠️' } : m
      ));
    } else if (inserted) {
      // Replace temp optimistic message with confirmed DB record
      setMsgs(prev => prev.map(m =>
        m.id === tempId ? {
          id: inserted.id,
          sender: inserted.sender_name ?? userName,
          text: inserted.content,
          isOwn: true,
          time: new Date(inserted.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        } : m
      ));
    }
  };

  // Show the OTHER person's name: if current user is the donor, show the participant's name;
  // otherwise show the donor's name. Fall back to prop > first received msg > placeholder.
  const isOwner = !!userId && userId === item.userId;
  const otherPersonName = otherPersonNameProp
    ?? (isOwner ? (msgs.find(m => !m.isOwn)?.sender ?? 'Корисник') : item.donorName);

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
            color: '#fe613e', flexShrink: 0,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#EDE5FF')}
          onMouseLeave={e => (e.currentTarget.style.background = '#F5F3FF')}
        >
          <ArrowLeftIcon />
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: '#0f52a1', lineHeight: 1.2 }}>
            {otherPersonName}
          </div>
          <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 700 }}>● Онлајн</div>
        </div>

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
              fontSize: 12, fontWeight: 800, color: '#0f52a1',
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
            <div style={{ fontWeight: 900, fontSize: 16, color: '#0f52a1', marginBottom: 6 }}>
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

            {msgs.map((m) => {
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

                  <div style={{
                    background: m.isOwn ? '#fe613e' : 'white',
                    color: m.isOwn ? 'white' : '#0f52a1',
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
            borderRadius: 0,
            padding: '12px 20px',
            fontSize: 14, fontWeight: 600,
            background: 'white', outline: 'none',
            color: '#0f52a1',
            transition: 'border-color 0.15s',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'rgba(123,79,255,0.4)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'rgba(123,79,255,0.15)')}
        />
        <button
          onClick={send}
          aria-label="Испрати"
          style={{
            background: '#fe613e', border: 'none', borderRadius: 0,
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
