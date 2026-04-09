'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ResetPassword() {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Supabase fires PASSWORD_RECOVERY when the user arrives via the reset link
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (pass.length < 6) { setError('Лозинката мора да биде барем 6 знаци'); return; }
    if (pass !== confirm) { setError('Лозинките не се совпаѓаат'); return; }
    setError('');
    setSubmitting(true);
    const { error: err } = await supabase.auth.updateUser({ password: pass });
    setSubmitting(false);
    if (err) setError(err.message);
    else setDone(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '2px solid #EDE5D8', borderRadius: 16,
    padding: '14px 18px', fontSize: 15, fontWeight: 700, outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFF9F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "var(--font-montserrat), 'Montserrat', sans-serif" }}>
      <div style={{ background: 'white', borderRadius: 28, padding: 40, width: 'min(440px, 100%)', boxShadow: '0 24px 80px rgba(0,0,0,0.12)' }}>

        <div style={{ fontSize: 22, fontWeight: 900, color: '#0f52a1', marginBottom: 8 }}>
          🔒 Нова лозинка
        </div>

        {done ? (
          <div style={{ textAlign: 'center', paddingTop: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#0f52a1', marginBottom: 8 }}>Лозинката е променета!</div>
            <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 24 }}>Можеш да се најавиш со новата лозинка.</div>
            <a href="/" style={{ background: '#fe613e', color: 'white', textDecoration: 'none', borderRadius: 50, padding: '14px 32px', fontSize: 15, fontWeight: 900 }}>
              Оди на почетна
            </a>
          </div>
        ) : !ready ? (
          <div style={{ color: '#888', fontWeight: 700, fontSize: 14, marginTop: 12 }}>
            Го верификуваме линкот... Ако оваа страница не се вчита, обиди се повторно преку е-мејлот.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 14, color: '#888', fontWeight: 700, marginBottom: 20 }}>
              Внеси нова лозинка за твојот профил.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={pass} onChange={e => { setPass(e.target.value); setError(''); }} placeholder="Нова лозинка" type="password" style={inputStyle} />
              <input value={confirm} onChange={e => { setConfirm(e.target.value); setError(''); }} placeholder="Потврди лозинка" type="password"
                style={{ ...inputStyle, borderColor: error ? '#E74C3C' : '#EDE5D8' }} />
              {error && <div style={{ fontSize: 13, fontWeight: 700, color: '#E74C3C', paddingLeft: 4 }}>⚠️ {error}</div>}
            </div>
            <button onClick={handleSubmit} disabled={submitting} style={{
              width: '100%', background: '#fe613e', border: 'none', borderRadius: 50,
              padding: '16px', fontSize: 16, fontWeight: 900, cursor: 'pointer', color: 'white',
              marginTop: 20, opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Момент...' : 'Зачувај нова лозинка'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
