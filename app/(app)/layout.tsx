'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AppProvider, useApp } from '@/lib/app-context';
import { CATEGORIES } from '@/data/donations';
import { supabase } from '@/lib/supabase';
import {
  UserIcon, LogoutIcon, BellIcon, ChatBubbleIcon, HeartIcon, GiftIcon,
  CategoryIcon, MenuIcon, CloseIcon, Toast, MessageToast, InterestToast, NotifPrompt,
  PostModal, AuthModal, DetailModal, EditDonationModal, ConfirmDialog, InterestedModal, timeAgo,
} from '@/app/components/shared';

function NavBar({ isMobile, mobileMenuOpen, onMenuToggle }: { isMobile: boolean; mobileMenuOpen: boolean; onMenuToggle: () => void }) {
  const router = useRouter();
  const {
    isLoggedIn, userName, userId,
    unreadCount, bellOpen, setBellOpen,
    notifications, notifLoading,
    loadNotifications, loadUnreadCount, setModal, setAuthDefaultTab,
    handleLogout, deleteConfirm, setDeleteConfirm, deleteLoading,
    handleDeleteAccount, toast, setToast,
    msgToast, setMsgToast, interestToast, setInterestToast, notifPrompt, setNotifPrompt,
    modal, authDefaultTab, handleAuthSubmit, handleForgotPassword,
    handlePostSubmit, selected, setSelected,
    donations, interestedIds, pendingInterestIds,
    handleInterest, setEditItem, handleDelete, editItem, handleEditSave,
    interestedItem, setInterestedItem,
  } = useApp();

  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!avatarOpen) return;
    const h = (e: MouseEvent) => { if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [avatarOpen]);

  useEffect(() => {
    if (!bellOpen) return;
    const h = (e: MouseEvent) => { if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [bellOpen, setBellOpen]);

  const handleAddClick = () => { if (!isLoggedIn) setModal('auth'); else setModal('post'); };

  return (
    <>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: '#E1B3EC', borderBottom: '1px solid rgba(0,0,0,0.06)', padding: '0 16px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isMobile && (
            <button onClick={onMenuToggle} aria-label={mobileMenuOpen ? 'Затвори мени' : 'Отвори мени'} aria-expanded={mobileMenuOpen} aria-controls="app-sidebar"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: '#1A1A2E', display: 'flex', alignItems: 'center' }}>
              <MenuIcon open={mobileMenuOpen} />
            </button>
          )}
          <Link href="/home" aria-label="Донирај.мк — почетна страна" style={{ fontSize: 22, fontWeight: 900, color: '#1A1A2E', letterSpacing: -0.5, textDecoration: 'none' }}>
            Донирај<span style={{ color: '#fe613e' }}>.</span>мк
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={handleAddClick} aria-label="Додај нова донација" style={{ background: '#fe613e', color: 'white', border: 'none', borderRadius: 0, textTransform: 'uppercase', padding: '10px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            {isMobile ? '+' : '+ Додај донација'}
          </button>

          {isLoggedIn && (
            <div ref={bellRef} style={{ position: 'relative' }}>
              <button onClick={() => { const opening = !bellOpen; setBellOpen(opening); if (opening && userId) loadNotifications(userId); }}
                aria-label={unreadCount > 0 ? `${unreadCount} непрочитани пораки` : 'Пораки'} aria-expanded={bellOpen}
                style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 10, color: '#1A1A2E', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.65')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
                <BellIcon size={22} />
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#fe613e', color: 'white', minWidth: 18, height: 18, borderRadius: 50, fontSize: 10, fontWeight: 600, padding: '0 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFF9F0' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {bellOpen && (
                <div style={{ position: 'absolute', top: 52, right: 0, zIndex: 1000, width: 'min(360px, calc(100vw - 32px))', background: 'white', borderRadius: 0, border: '1px solid #F0EEF8', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', overflow: 'hidden', animation: 'scaleIn 0.15s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px', borderBottom: '1px solid #F0EEF8' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: '#0f52a1' }}>Нотификации</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {notifications.some(n => !n.read) && (
                        <button onClick={async () => {
                          if (!userId) return;
                          const msgIds = notifications.filter(n => n.type === 'message' && !n.read).map(n => n.conversationId).filter(Boolean) as string[];
                          const intIds = notifications.filter(n => n.type === 'interest' && !n.read).map(n => n.id);
                          await Promise.all([
                            ...(msgIds.length > 0 ? msgIds.map(cid => supabase.from('messages').update({ read: true }).eq('conversation_id', cid).neq('sender_id', userId)) : []),
                            ...(intIds.length > 0 ? [supabase.from('notifications').update({ read: true }).in('id', intIds)] : []),
                          ]);
                          loadNotifications(userId);
                          loadUnreadCount(userId);
                        }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fe613e', fontSize: 10, fontWeight: 700, padding: '2px 4px', lineHeight: 1.3, textAlign: 'right', maxWidth: 120 }}>
                          Означи ги сите како прочитани
                        </button>
                      )}
                      <button onClick={() => setBellOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A0A0B8', fontSize: 18, lineHeight: 1, padding: '0 2px' }}>×</button>
                    </div>
                  </div>
                  <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                    {notifLoading ? (
                      [0, 1, 2].map(i => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid #F0EEF8' }}>
                          <div style={{ width: 36, height: 36, borderRadius: 50, background: '#EDE5D8', animation: 'shimmer 1.4s ease infinite', flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ height: 12, width: '55%', borderRadius: 6, background: '#EDE5D8', animation: 'shimmer 1.4s ease infinite' }} />
                            <div style={{ height: 10, width: '80%', borderRadius: 6, background: '#EDE5D8', animation: 'shimmer 1.4s ease infinite' }} />
                          </div>
                        </div>
                      ))
                    ) : notifications.length === 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 120, gap: 8, padding: 24 }}>
                        <img src="/bell.svg" alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                        <span style={{ fontSize: 14, color: '#6B6B8A', fontWeight: 700 }}>Немаш нови известувања</span>
                      </div>
                    ) : (
                      notifications.map((n, i) => {
                        const isMsg = n.type === 'message';
                        const bgUnread = isMsg ? '#FFFAF8' : '#FFF8FF';
                        const dotColor = isMsg ? '#fe613e' : '#e1b3ec';
                        return (
                          <div key={n.id}
                            onClick={async () => {
                              if (isMsg) {
                                if (userId) await supabase.from('messages').update({ read: true }).eq('conversation_id', n.conversationId).neq('sender_id', userId);
                                setBellOpen(false);
                                router.push(`/poraki/${n.conversationId}`);
                              } else {
                                await supabase.from('notifications').update({ read: true }).eq('id', n.id);
                                if (userId) { loadNotifications(userId); loadUnreadCount(userId); }
                                const donation = donations.find(d => d.id === n.donationId);
                                if (donation) setSelected(donation);
                                setBellOpen(false);
                              }
                            }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', background: n.read ? 'white' : bgUnread, borderBottom: i < notifications.length - 1 ? '1px solid #F0EEF8' : 'none', transition: 'background 0.12s' }}
                            onMouseEnter={e => (e.currentTarget.style.background = isMsg ? '#FFF5F2' : '#F8F0FF')}
                            onMouseLeave={e => (e.currentTarget.style.background = n.read ? 'white' : bgUnread)}>
                            <div style={{ width: 8, height: 8, borderRadius: 50, background: n.read ? 'transparent' : dotColor, flexShrink: 0 }} />
                            {isMsg ? (
                              <div style={{ width: 36, height: 36, borderRadius: 50, background: '#fe613e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{n.title.slice(0, 2).toUpperCase()}</div>
                            ) : (
                              <div style={{ width: 36, height: 36, borderRadius: 50, background: '#FFF0F8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>❤️</div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f52a1', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                              <div style={{ fontSize: 13, color: '#6B6B8A', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.body.length > 45 ? n.body.slice(0, 45) + '…' : n.body}</div>
                            </div>
                            <div style={{ fontSize: 11, color: '#A0A0B8', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.createdAt)}</div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={avatarRef} style={{ position: 'relative' }}>
            <button onClick={() => isLoggedIn ? setAvatarOpen(o => !o) : setModal('auth')}
              aria-label={isLoggedIn ? `Профил: ${userName}` : 'Најави се'} aria-expanded={isLoggedIn ? avatarOpen : undefined}
              style={{ width: 40, height: 40, borderRadius: 50, background: isLoggedIn ? '#fe613e' : '#E8E0D5', color: isLoggedIn ? 'white' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, cursor: 'pointer', border: 'none', boxShadow: isLoggedIn ? '0 2px 10px rgba(255,107,74,0.35)' : 'none' }}>
              {isLoggedIn ? userName.slice(0, 2).toUpperCase() : <UserIcon />}
            </button>
            {avatarOpen && isLoggedIn && (
              <div style={{ position: 'absolute', top: 48, right: 0, zIndex: 401, background: 'white', borderRadius: 0, padding: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.14)', minWidth: 180, animation: 'scaleIn 0.15s ease' }}>
                <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#aaa', borderBottom: '1px solid #f0e8e0', marginBottom: 4 }}>{userName}</div>
                <button onClick={() => { handleLogout(); setAvatarOpen(false); }} style={{ width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 14, fontWeight: 800, color: '#E74C3C', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FFF0EE')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <LogoutIcon size={16} /> Одјави се
                </button>
                <button onClick={() => { setDeleteConfirm(true); setAvatarOpen(false); }} style={{ width: '100%', background: 'none', border: 'none', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 800, color: '#aaa', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #f5f0ea', marginTop: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#E74C3C')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#aaa')}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                  Избриши акаунт
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Global modals */}
      {modal === 'post' && <PostModal onClose={() => setModal(null)} onSubmit={handlePostSubmit} />}
      {modal === 'auth' && <AuthModal onClose={() => setModal(null)} onSubmit={handleAuthSubmit} onForgotPassword={handleForgotPassword} defaultTab={authDefaultTab} />}
      {selected && (
        <DetailModal
          item={donations.find(d => d.id === selected.id) ?? selected}
          onClose={() => setSelected(null)}
          onInterest={() => isLoggedIn ? handleInterest(selected.id) : (setAuthDefaultTab('login'), setModal('auth'))}
          isLoggedIn={isLoggedIn}
          isInterested={interestedIds.has(selected.id)}
          interestDisabled={pendingInterestIds.has(selected.id)}
          onAuthRequired={() => { setAuthDefaultTab('login'); setModal('auth'); }}
          userId={userId}
          userName={userName}
          onEdit={item => setEditItem(item)}
          onDelete={id => handleDelete(id)}
          onViewInterested={item => setInterestedItem(item)}
        />
      )}
      {editItem && <EditDonationModal item={editItem} onClose={() => setEditItem(null)} onSave={handleEditSave} />}
      {interestedItem && <InterestedModal item={interestedItem} onClose={() => setInterestedItem(null)} />}
      {deleteConfirm && (
        <ConfirmDialog
          title="Избриши акаунт"
          message="Акаунтот ќе биде трајно избришан заедно со сите твои донации и пораки. Оваа акција не може да се поништи."
          onConfirm={handleDeleteAccount}
          onCancel={() => setDeleteConfirm(false)}
          loading={deleteLoading}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {msgToast && (
        <MessageToast data={msgToast} onClose={() => setMsgToast(null)}
          onClick={() => { setMsgToast(null); router.push(`/poraki/${msgToast.conversationId}`); }} />
      )}
      {interestToast && (
        <InterestToast data={interestToast} onClose={() => setInterestToast(null)}
          onClick={() => {
            const donation = donations.find(d => d.id === interestToast.donationId);
            if (donation) setSelected(donation);
            setInterestToast(null);
          }} />
      )}
      {notifPrompt && (
        <NotifPrompt
          onAllow={() => { setNotifPrompt(false); localStorage.setItem('notif-asked', '1'); if ('Notification' in window) Notification.requestPermission(); }}
          onLater={() => { setNotifPrompt(false); localStorage.setItem('notif-asked', '1'); }} />
      )}
    </>
  );
}

// Needs its own component so useSearchParams is inside a Suspense boundary
function CategoryLinks({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCat = pathname === '/home' ? (searchParams.get('cat') || 'Сите') : '';

  return (
    <>
      {CATEGORIES.map(c => {
        const active = c.id === activeCat;
        return (
          <Link key={c.id} href={c.id === 'Сите' ? '/home' : `/home?cat=${encodeURIComponent(c.id)}`}
            onClick={onClose}
            style={{ background: active ? '#FFF0EC' : 'transparent', borderRadius: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', color: active ? '#fe613e' : '#555', width: '100%', textDecoration: 'none', transition: 'all 0.15s' }}
            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '#F5F0EB'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = active ? '#FFF0EC' : 'transparent'; }}>
            <CategoryIcon id={c.id} size={18} />
            {c.label}
          </Link>
        );
      })}
    </>
  );
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { isLoggedIn, unreadCount, interestedIds, donations, userId, conversations } = useApp();
  const myDonationsCount = donations.filter(d => d.userId === userId).length;
  const convCount = Object.keys(conversations).length;

  return (
    <aside id="app-sidebar" style={{
      width: 220, flexShrink: 0, padding: '24px 14px',
      borderRight: '1px solid rgba(0,0,0,0.06)',
      position: 'sticky', top: 64, height: 'calc(100vh - 64px)',
      overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4,
      background: '#FFF9F0',
    }}>
      <div style={{ fontSize: 11, fontWeight: 900, color: '#fe613e', letterSpacing: 1.2, marginBottom: 6, paddingLeft: 14 }}>КАТЕГОРИИ</div>
      <Suspense fallback={
        CATEGORIES.map(c => (
          <div key={c.id} style={{ borderRadius: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 800, color: '#555' }}>
            <CategoryIcon id={c.id} size={18} />{c.label}
          </div>
        ))
      }>
        <CategoryLinks onClose={onClose} />
      </Suspense>

      {isLoggedIn && (
        <>
          <div style={{ height: 1, background: '#EDE5D8', margin: '12px 4px' }} />
          <div style={{ fontSize: 11, fontWeight: 900, color: '#fe613e', letterSpacing: 1.2, marginBottom: 6, paddingLeft: 14 }}>МОЈОТ ПРОФИЛ</div>

          {[
            { href: '/poraki', label: 'Пораки', icon: <img src="/chat.svg" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />, badge: convCount > 0 ? String(convCount) : null, badgeColor: '#fe613e' },
            { href: '/interesi', label: 'Мои интереси', icon: <img src="/besplatno.svg" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />, badge: interestedIds.size > 0 ? String(interestedIds.size) : null, badgeColor: '#fe613e' },
            { href: '/donacii', label: 'Мои донации', icon: <img src="/drugo.svg" alt="" style={{ width: 17, height: 17, objectFit: 'contain' }} />, badge: myDonationsCount > 0 ? String(myDonationsCount) : null, badgeColor: '#0f52a1' },
          ].map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                style={{ background: active ? '#FFF0EC' : 'transparent', border: 'none', borderRadius: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 800, cursor: 'pointer', color: active ? '#fe613e' : '#555', width: '100%', textDecoration: 'none', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = '#F5F0EB'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                {item.label}
                {item.badge && (
                  <span style={{ marginLeft: 'auto', background: item.badgeColor, color: 'white', borderRadius: 50, padding: '2px 8px', fontSize: 11, fontWeight: 900 }}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </>
      )}
    </aside>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    setIsMobile(mq.matches);
    const h = (e: MediaQueryListEvent) => { setIsMobile(e.matches); if (!e.matches) setMobileMenuOpen(false); };
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}>
      <a href="#main-content" className="skip-link">Скокни на содржината</a>

      <NavBar isMobile={isMobile} mobileMenuOpen={mobileMenuOpen} onMenuToggle={() => setMobileMenuOpen(o => !o)} />

      <div style={{ display: 'flex' }}>
        {isMobile && mobileMenuOpen && (
          <div aria-hidden="true" onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, top: 64, background: 'rgba(0,0,0,0.28)', zIndex: 99 }} />
        )}

        {(!isMobile || mobileMenuOpen) && (
          <div style={isMobile ? { position: 'fixed', top: 64, left: 0, bottom: 0, zIndex: 100, boxShadow: '4px 0 24px rgba(0,0,0,0.12)' } : {}}>
            <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          </div>
        )}

        <main id="main-content" style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppShell>{children}</AppShell>
    </AppProvider>
  );
}
