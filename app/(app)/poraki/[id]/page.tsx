'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import ChatScreen from '@/app/components/ChatScreen';

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { conversations, userId, userName, loadConversations, markConversationRead, isLoggedIn, setModal } = useApp();

  const conversation = conversations[id];

  useEffect(() => {
    if (!userId) return;
    if (!conversation) {
      loadConversations(userId);
    } else {
      markConversationRead(id, userId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, userId]);

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)', gap: 16 }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 900, color: '#0f52a1' }}>Треба да се најавиш</div>
        <button onClick={() => setModal('auth')} style={{ background: '#fe613e', color: 'white', border: 'none', borderRadius: 50, padding: '14px 32px', fontSize: 15, fontWeight: 900, cursor: 'pointer' }}>
          Најави се
        </button>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <div style={{ fontSize: 14, color: '#bbb', fontWeight: 700 }}>Се вчитува...</div>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)' }}>
      <ChatScreen
        item={conversation.item}
        conversationId={id}
        userId={userId}
        userName={userName}
        otherPersonName={conversation.msgs.find(m => !m.isOwn)?.sender}
        onBack={() => { loadConversations(userId!); router.push('/poraki'); }}
      />
    </div>
  );
}
