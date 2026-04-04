'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { mapDonation } from '@/lib/utils';
import { DonationItem, ChatMessage } from '@/types';
import ChatScreen from '../components/ChatScreen';

type Conversation = { item: DonationItem; msgs: ChatMessage[]; };

function ChatBubbleIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  const loadConversations = useCallback(async (uid: string) => {
    // Messages I sent
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: sent } = await supabase
      .from('messages').select('*').eq('sender_id', uid).order('created_at', { ascending: true });
    // Messages received on my donations
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: myDons } = await supabase.from('donations').select('id').eq('user_id', uid);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myDonIds = (myDons || []).map((d: any) => d.id as string);
    const { data: received } = myDonIds.length > 0
      ? await supabase.from('messages').select('*').in('donation_id', myDonIds).neq('sender_id', uid).order('created_at', { ascending: true })
      : { data: [] };
    // Merge and deduplicate
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allMsgs = [...(sent || []), ...(received || [])];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unique = Array.from(new Map(allMsgs.map((m: any) => [m.id, m])).values())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    if (unique.length === 0) { setConversations({}); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const donIds = [...new Set(unique.map((m: any) => m.donation_id as string))];
    const { data: items } = await supabase.from('donations').select('*').in('id', donIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const itemMap = new Map((items || []).map((d: any) => [d.id, mapDonation(d)]));
    const convMap: Record<string, Conversation> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const msg of unique as any[]) {
      const item = itemMap.get(msg.donation_id);
      if (!item) continue;
      if (!convMap[msg.donation_id]) convMap[msg.donation_id] = { item, msgs: [] };
      convMap[msg.donation_id].msgs.push({
        id: msg.id, sender: msg.sender_name, text: msg.text,
        isOwn: msg.sender_id === uid,
        time: new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setConversations(convMap);
  }, []);

  useEffect(() => {
    // Load immediately for already-logged-in users
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const user = session.user;
        const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Корисник';
        setUserId(user.id);
        setUserName(name);
        await loadConversations(user.id);
      }
      setLoading(false);
    });

    // Handle future auth changes (login/logout while on the page), skip INITIAL_SESSION
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') return;
      if (session?.user) {
        const user = session.user;
        const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Корисник';
        setUserId(user.id);
        setUserName(name);
        await loadConversations(user.id);
      } else {
        setUserId(null);
        setUserName('');
        setConversations({});
      }
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, [loadConversations]);

  const handleDelete = async (itemId: string) => {
    await supabase.from('messages').delete().eq('donation_id', itemId).eq('participant_id', userId!);
    setConversations(prev => { const n = { ...prev }; delete n[itemId]; return n; });
    if (openItemId === itemId) setOpenItemId(null);
  };

  const openConv = openItemId ? conversations[openItemId] : null;
  const convList = Object.values(conversations);

  // ── Full-screen chat when a conversation is open ──
  if (openConv) {
    return (
      <div style={{
        position: 'fixed', inset: 0,
        background: '#FFF9F0',
        fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
      }}>
        <ChatScreen
          item={openConv.item}
          userId={userId}
          userName={userName}
          onBack={() => { setOpenItemId(null); if (userId) loadConversations(userId); }}
        />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFF9F0',
      fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif",
    }}>
      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,249,240,0.96)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <Link
          href="/"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#F5F3FF', border: 'none', borderRadius: 50,
            width: 36, height: 36, color: '#7B4FFF', textDecoration: 'none',
          }}
          aria-label="Назад"
        >
          <ArrowLeftIcon />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChatBubbleIcon size={20} />
          <span style={{ fontSize: 20, fontWeight: 900, color: '#1A1A2E', letterSpacing: -0.5 }}>
            Пораки
          </span>
        </div>
      </nav>

      {/* ── Content ── */}
      <main style={{ maxWidth: 640, margin: '0 auto', padding: '32px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                background: 'white', borderRadius: 20, padding: '16px 20px',
                height: 80, animation: 'shimmer 1.6s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : convList.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ color: '#C4B5A0', marginBottom: 16 }}><ChatBubbleIcon size={64} /></div>
            <div style={{ fontSize: 20, fontWeight: 900, color: '#555', marginBottom: 8 }}>
              Немаш активни разговори
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#bbb', marginBottom: 28 }}>
              Отвори некој предмет и кликни „Контактирај"
            </div>
            <Link
              href="/"
              style={{
                background: '#FF6B4A', color: 'white', borderRadius: 50,
                padding: '12px 28px', fontSize: 15, fontWeight: 900,
                textDecoration: 'none', display: 'inline-block',
              }}
            >
              Прегледај донации →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {convList.map(({ item, msgs }) => {
              const last = msgs[msgs.length - 1];
              return (
                <div
                  key={item.id}
                  onClick={() => setOpenItemId(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setOpenItemId(item.id); }}
                  style={{
                    background: 'white', borderRadius: 20, padding: '14px 18px',
                    display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = '';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Item thumbnail */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 16, background: item.cardColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, flexShrink: 0,
                  }}>
                    {item.emoji}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontWeight: 900, fontSize: 15, color: '#1A1A2E' }}>{item.donorName}</span>
                      {last && <span style={{ fontSize: 12, color: '#bbb', fontWeight: 700 }}>{last.time}</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#aaa', fontWeight: 700, marginBottom: 2 }}>{item.title}</div>
                    {last && (
                      <div style={{
                        fontSize: 13, color: '#777', fontWeight: 700,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {last.isOwn ? 'Јас: ' : ''}{last.text}
                      </div>
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(item.id); }}
                    title="Избриши"
                    aria-label="Избриши разговор"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 16, color: '#ddd', padding: '4px', flexShrink: 0,
                      borderRadius: 8, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}
                  >🗑️</button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
