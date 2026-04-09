'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { DonationItem, ChatMessage, Conversation, NotificationItem, MsgToastData, InterestToastData } from '@/types';
import { mapDonation } from '@/lib/utils';
import { CATEGORY_COLORS, POST_CATEGORIES } from '@/data/donations';

export interface AppContextType {
  // Auth
  isLoggedIn: boolean;
  userId: string | null;
  userName: string;
  // Data
  donations: DonationItem[];
  donationsLoading: boolean;
  interestedIds: Set<string>;
  pendingInterestIds: Set<string>;
  conversations: Record<string, Conversation>;
  unreadCount: number;
  notifications: NotificationItem[];
  notifLoading: boolean;
  // UI state (cross-page)
  bellOpen: boolean;
  setBellOpen: (v: boolean) => void;
  msgToast: MsgToastData | null;
  setMsgToast: (v: MsgToastData | null) => void;
  interestToast: InterestToastData | null;
  setInterestToast: (v: InterestToastData | null) => void;
  interestedItem: DonationItem | null;
  setInterestedItem: (v: DonationItem | null) => void;
  notifPrompt: boolean;
  setNotifPrompt: (v: boolean) => void;
  modal: null | 'post' | 'auth';
  setModal: (v: null | 'post' | 'auth') => void;
  authDefaultTab: 'login' | 'reg';
  setAuthDefaultTab: (v: 'login' | 'reg') => void;
  selected: DonationItem | null;
  setSelected: (v: DonationItem | null) => void;
  toast: string | null;
  setToast: (v: string | null) => void;
  deleteConfirm: boolean;
  setDeleteConfirm: (v: boolean) => void;
  deleteLoading: boolean;
  editItem: DonationItem | null;
  setEditItem: (v: DonationItem | null) => void;
  // Actions
  loadDonations: () => Promise<void>;
  loadConversations: (uid: string) => Promise<Record<string, Conversation>>;
  loadUnreadCount: (uid: string) => Promise<void>;
  loadNotifications: (uid: string) => Promise<void>;
  handleInterest: (itemId: string) => Promise<void>;
  handleLogout: () => void;
  handleDeleteAccount: () => Promise<void>;
  handlePostSubmit: (data: Partial<DonationItem>) => Promise<void>;
  handleAuthSubmit: (d: { tab: 'login' | 'reg'; email: string; pass: string; name: string }) => Promise<string | null>;
  handleForgotPassword: (email: string) => Promise<string | null>;
  handleEditSave: (updated: DonationItem) => Promise<void>;
  handleDelete: (itemId: string) => Promise<void>;
  markConversationRead: (conversationId: string, uid: string) => Promise<void>;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(true);
  const [interestedIds, setInterestedIds] = useState<Set<string>>(new Set());
  const [pendingInterestIds, setPendingInterestIds] = useState<Set<string>>(new Set());
  const [conversations, setConversations] = useState<Record<string, Conversation>>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [msgToast, setMsgToast] = useState<MsgToastData | null>(null);
  const [interestToast, setInterestToast] = useState<InterestToastData | null>(null);
  const [interestedItem, setInterestedItem] = useState<DonationItem | null>(null);
  const [notifPrompt, setNotifPrompt] = useState(false);
  const [modal, setModal] = useState<null | 'post' | 'auth'>(null);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'reg'>('login');
  const [selected, setSelected] = useState<DonationItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editItem, setEditItem] = useState<DonationItem | null>(null);
  const didLogOutRef = useRef(false);

  const showToast = useCallback((msg: string) => setToast(msg), []);

  const loadDonations = useCallback(async () => {
    const { data, error } = await supabase
      .from('donations')
      .select('id, title, description, category, condition, location, donor_name, donor_avatar, image, emoji, card_color, accent_color, created_at_iso, interested_count, user_id')
      .order('created_at_iso', { ascending: false });
    if (error) { console.error('[loadDonations]', error.message); setDonationsLoading(false); return; }
    setDonations((data || []).map(mapDonation));
    setDonationsLoading(false);
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadConversations = useCallback(async (uid: string): Promise<Record<string, Conversation>> => {
    // Fetch as participant AND as donation owner (two queries to bypass RLS gaps)
    const [{ data: asParticipant }, { data: myDonations }] = await Promise.all([
      supabase.from('conversations').select('id, donation_id, created_at').eq('participant_id', uid),
      supabase.from('donations').select('id').eq('user_id', uid),
    ]);
    let asOwner: any[] = [];
    const myDonIds = (myDonations || []).map((d: any) => d.id as string);
    if (myDonIds.length > 0) {
      const { data } = await supabase.from('conversations').select('id, donation_id, created_at').in('donation_id', myDonIds);
      asOwner = data || [];
    }
    // Merge + deduplicate + sort newest first
    const seen = new Set<string>();
    const merged = [...(asParticipant || []), ...asOwner]
      .filter((c: any) => { if (seen.has(c.id)) return false; seen.add(c.id); return true; })
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const convs = merged;
    if (convs.length === 0) { setConversations({}); return {}; }

    const convIds = convs.map((c: any) => c.id as string);
    const donIds = [...new Set(convs.map((c: any) => c.donation_id as string))];

    const [{ data: msgs, error: msgsErr }, { data: items }] = await Promise.all([
      supabase.from('messages').select('*').in('conversation_id', convIds).order('created_at', { ascending: true }),
      supabase.from('donations').select('id, title, description, category, condition, location, donor_name, donor_avatar, image, emoji, card_color, accent_color, created_at_iso, interested_count, user_id').in('id', donIds),
    ]);
    if (msgsErr) { console.error('[loadConversations] msgs', msgsErr.message); return {}; }

    const itemMap = new Map((items || []).map((d: any) => [d.id, mapDonation(d)]));
    const convMap: Record<string, Conversation> = {};
    for (const conv of convs as any[]) {
      const item = itemMap.get(conv.donation_id);
      if (!item) continue;
      convMap[conv.id] = { conversationId: conv.id, item, msgs: [], lastMsgAt: conv.created_at ?? '' };
    }
    for (const msg of (msgs || []) as any[]) {
      const c = convMap[msg.conversation_id];
      if (!c) continue;
      c.lastMsgAt = msg.created_at;
      c.msgs.push({
        id: msg.id,
        sender: msg.sender_name ?? '',
        text: msg.content,
        isOwn: msg.sender_id === uid,
        time: new Date(msg.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setConversations(convMap);
    if (convIds.length > 0) {
      supabase.from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', uid).eq('read', false).in('conversation_id', convIds)
        .then(({ count }) => {
          // Don't reset unreadCount here — loadUnreadCount combines both sources
          // Just trigger a full recalculation
          loadUnreadCount(uid);
        });
    } else {
      loadUnreadCount(uid);
    }
    return convMap;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUnreadCount = useCallback(async (uid: string) => {
    // Count unread messages — same two-query approach as loadConversations
    const [{ data: p }, { data: md }] = await Promise.all([
      supabase.from('conversations').select('id').eq('participant_id', uid),
      supabase.from('donations').select('id').eq('user_id', uid),
    ]);
    let oc: any[] = [];
    const mdIds = (md || []).map((d: any) => d.id as string);
    if (mdIds.length > 0) {
      const { data } = await supabase.from('conversations').select('id').in('donation_id', mdIds);
      oc = data || [];
    }
    const seenU = new Set<string>();
    const ids = [...(p || []), ...oc]
      .filter((c: any) => { if (seenU.has(c.id)) return false; seenU.add(c.id); return true; })
      .map((c: any) => c.id as string);
    let msgCount = 0;
    if (ids.length > 0) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .neq('sender_id', uid).eq('read', false).in('conversation_id', ids);
      msgCount = count ?? 0;
    }
    // Count unread interest notifications
    const { count: interestCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('read', false);
    setUnreadCount(msgCount + (interestCount ?? 0));
  }, []);

  const markConversationRead = useCallback(async (conversationId: string, uid: string) => {
    await supabase.from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', uid);
    loadUnreadCount(uid);
  }, [loadUnreadCount]);

  const loadNotifications = useCallback(async (uid: string) => {
    setNotifLoading(true);
    try {
      // Message notifications — get all conversation IDs visible to this user (as participant OR owner)
      const [{ data: asParticipant2 }, { data: myDons }] = await Promise.all([
        supabase.from('conversations').select('id').eq('participant_id', uid),
        supabase.from('donations').select('id').eq('user_id', uid),
      ]);
      let ownerConvs: any[] = [];
      const myDonIds2 = (myDons || []).map((d: any) => d.id as string);
      if (myDonIds2.length > 0) {
        const { data } = await supabase.from('conversations').select('id').in('donation_id', myDonIds2);
        ownerConvs = data || [];
      }
      const seenIds = new Set<string>();
      const allConvIds = [...(asParticipant2 || []), ...ownerConvs]
        .filter((c: any) => { if (seenIds.has(c.id)) return false; seenIds.add(c.id); return true; });
      const ids = allConvIds.map((c: any) => c.id as string);
      const msgNotifs: NotificationItem[] = [];
      if (ids.length > 0) {
        const { data: msgs } = await supabase
          .from('messages')
          .select('id, content, created_at, sender_name, conversation_id')
          .neq('sender_id', uid).eq('read', false).in('conversation_id', ids)
          .order('created_at', { ascending: false });
        const seen = new Set<string>();
        for (const m of (msgs || []) as any[]) {
          if (!seen.has(m.conversation_id)) {
            seen.add(m.conversation_id);
            msgNotifs.push({
              id: m.id,
              type: 'message',
              title: m.sender_name ?? '?',
              body: m.content ?? '',
              read: false,
              createdAt: m.created_at,
              conversationId: m.conversation_id,
            });
          }
          if (msgNotifs.length >= 5) break;
        }
      }

      // Interest notifications from notifications table
      const { data: interestRows } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(10);
      const interestNotifs: NotificationItem[] = (interestRows || []).map((n: any) => ({
        id: n.id,
        type: 'interest' as const,
        title: n.title,
        body: n.body,
        read: n.read,
        createdAt: n.created_at,
        donationId: n.donation_id,
      }));

      // Merge and sort by date descending
      const all = [...msgNotifs, ...interestNotifs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setNotifications(all);
    } finally {
      setNotifLoading(false);
    }
  }, []);

  const handleInterest = useCallback(async (itemId: string) => {
    if (!userId || pendingInterestIds.has(itemId)) return;
    setPendingInterestIds(prev => new Set([...prev, itemId]));
    const adding = !interestedIds.has(itemId);
    const prevIds = new Set(interestedIds);
    // Optimistically update interestedIds (heart fill/unfill) but NOT the count —
    // count comes from DB after RPC to avoid double-counting with realtime.
    const next = new Set(interestedIds);
    if (adding) next.add(itemId); else next.delete(itemId);
    setInterestedIds(next);
    let toggleError: { message: string } | null = null;
    const { error: rpcError } = await supabase.rpc('toggle_interest', { p_donation_id: itemId, p_user_id: userId, p_user_name: userName });
    if (rpcError) {
      console.error('[handleInterest] RPC failed:', rpcError.message, '— trying direct fallback');
      // Fallback: direct INSERT or DELETE on interests table (uses RLS policies)
      if (adding) {
        const { error: insErr } = await supabase.from('interests').insert({ user_id: userId, donation_id: itemId, user_name: userName });
        toggleError = insErr;
      } else {
        const { error: delErr } = await supabase.from('interests').delete().eq('user_id', userId).eq('donation_id', itemId);
        toggleError = delErr;
      }
      if (toggleError) console.error('[handleInterest] fallback failed:', toggleError.message);
    }
    if (toggleError) {
      setInterestedIds(prevIds);
    } else {
      // Reload donations so interestedCount reflects the authoritative DB value
      await loadDonations();
      showToast(adding ? '🎉 Донаторот е известен!' : '💔 Интересот е отстранет');
      // Insert interest notification for the donor (only when adding, not removing)
      if (adding) {
        const { data: donation } = await supabase
          .from('donations')
          .select('user_id, title')
          .eq('id', itemId)
          .single();
        if (donation?.user_id && donation.user_id !== userId) {
          await supabase.from('notifications').insert({
            user_id: donation.user_id,
            type: 'interest',
            title: 'Нов интерес!',
            body: `${userName} е заинтересиран/а за „${donation.title}"`,
            donation_id: itemId,
            from_user_id: userId,
            read: false,
          });
        }
      }
    }
    setPendingInterestIds(prev => { const s = new Set(prev); s.delete(itemId); return s; });
  }, [userId, userName, interestedIds, pendingInterestIds, loadDonations, showToast]);

  const handleLogout = useCallback(() => {
    didLogOutRef.current = true;
    supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
    setInterestedIds(new Set());
    setConversations({});
    showToast('👋 Се одјавивте успешно.');
    router.push('/home');
  }, [showToast, router]);

  const handleDeleteAccount = useCallback(async () => {
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
    didLogOutRef.current = true;
    setIsLoggedIn(false);
    setUserId(null);
    setUserName('');
    setInterestedIds(new Set());
    setConversations({});
    showToast('🗑️ Акаунтот е избришан.');
  }, [showToast]);

  const handleForgotPassword = useCallback(async (email: string): Promise<string | null> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : '/reset-password',
    });
    return error ? error.message : null;
  }, []);

  const handleAuthSubmit = useCallback(async ({ tab, email, pass, name }: { tab: 'login' | 'reg'; email: string; pass: string; name: string }): Promise<string | null> => {
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
  }, []);

  const handleEditSave = useCallback(async (updated: DonationItem) => {
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
  }, [showToast]);

  const handleDelete = useCallback(async (itemId: string) => {
    const { error } = await supabase.from('donations').delete().eq('id', itemId);
    if (!error) {
      setDonations(prev => prev.filter(d => d.id !== itemId));
      showToast('🗑️ Донацијата е избришана.');
    }
  }, [showToast]);

  const handlePostSubmit = useCallback(async (data: Partial<DonationItem>): Promise<void> => {
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
      image: data.image ?? null, images: data.images ?? null,
      emoji, card_color: colors.card, accent_color: colors.accent,
      user_id: userId, interested_count: 0,
    });
    if (!error) {
      setModal(null);
      showToast('🎉 Донацијата е објавена!');
      await loadDonations();
    }
  }, [userId, userName, loadDonations, showToast]);

  // ── Effects ──────────────────────────────────────────────────────────────

  // Suppress unhandled promise rejections from Supabase lock contention
  useEffect(() => {
    const handler = (e: PromiseRejectionEvent) => {
      if (e.reason?.message?.includes('lock') || e.reason?.isAcquireTimeout) e.preventDefault();
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  // Auth state
  useEffect(() => {
    // Load donations immediately — don't wait for onAuthStateChange
    loadDonations();

    const donationsChannel = supabase.channel('donations-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'donations' }, () => loadDonations())
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (_event === 'SIGNED_IN') didLogOutRef.current = false;
      if (_event !== 'INITIAL_SESSION') loadDonations();
      if (session?.user && !didLogOutRef.current) {
        const user = session.user;
        const name = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Корисник';
        setIsLoggedIn(true);
        setUserName(name);
        setUserId(user.id);
        const { data: ints } = await supabase
          .from('interests').select('donation_id').eq('user_id', user.id);
        setInterestedIds(new Set((ints || []).map((r: any) => r.donation_id)));
        await loadConversations(user.id);
      } else {
        setIsLoggedIn(false);
        setUserName('');
        setUserId(null);
        setInterestedIds(new Set());
        setConversations({});
        setUnreadCount(0);
      }
    });
    return () => { subscription.unsubscribe(); supabase.removeChannel(donationsChannel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Inbox realtime — fires when a message is received
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('inbox-' + userId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id === userId) return;
        loadConversations(userId);
        setMsgToast({ senderName: msg.sender_name ?? '?', content: msg.content ?? '', conversationId: msg.conversation_id });
        loadUnreadCount(userId);
        if (bellOpen) loadNotifications(userId);
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' && !document.hasFocus()) {
          const n = new Notification('Нова порака — Донирај.мк', {
            body: `${msg.sender_name}: ${msg.content}`,
            icon: '/favicon.ico',
          });
          n.onclick = () => { window.focus(); n.close(); };
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bellOpen]);

  // Notifications realtime — fires when a new interest notification arrives
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('notifs-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new as any;
        const item: NotificationItem = {
          id: n.id,
          type: 'interest',
          title: n.title,
          body: n.body,
          read: false,
          createdAt: n.created_at,
          donationId: n.donation_id,
        };
        setNotifications(prev => [item, ...prev]);
        setUnreadCount(prev => prev + 1);
        setInterestToast({ title: n.title, body: n.body, donationId: n.donation_id });
        if (bellOpen) loadNotifications(userId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, bellOpen]);

  // Notification prompt
  useEffect(() => {
    if (!userId) return;
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (localStorage.getItem('notif-asked') === '1') return;
    const t = setTimeout(() => setNotifPrompt(true), 2000);
    return () => clearTimeout(t);
  }, [userId]);

  const value: AppContextType = {
    isLoggedIn, userId, userName,
    donations, donationsLoading,
    interestedIds, pendingInterestIds,
    conversations, unreadCount,
    notifications, notifLoading,
    bellOpen, setBellOpen,
    msgToast, setMsgToast,
    interestToast, setInterestToast,
    interestedItem, setInterestedItem,
    notifPrompt, setNotifPrompt,
    modal, setModal,
    authDefaultTab, setAuthDefaultTab,
    selected, setSelected,
    toast, setToast,
    deleteConfirm, setDeleteConfirm,
    deleteLoading,
    editItem, setEditItem,
    loadDonations, loadConversations, loadUnreadCount, loadNotifications,
    handleInterest, handleLogout, handleDeleteAccount,
    handlePostSubmit, handleAuthSubmit, handleForgotPassword,
    handleEditSave, handleDelete, markConversationRead,
    showToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
