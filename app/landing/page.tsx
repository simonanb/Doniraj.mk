'use client';

import React from 'react';
import { HandDrawnBorder } from '@/app/components/HandDrawnBorder';

const FONT_SANS   = "var(--font-montserrat), 'Montserrat', sans-serif";
const FONT_AMATIC = "var(--font-amatic-sc), var(--font-neucha), cursive";

// Inline label style (used inside flex-centered wrapper divs)
const IL: React.CSSProperties = {
  margin: '0 0.15em',
  fontFamily: FONT_AMATIC,
  fontSize: 38,
  fontWeight: 700,
  color: '#fff9f0',
  textTransform: 'uppercase',
  textAlign: 'center',
  lineHeight: 1,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
};


export default function LandingPage() {
  return (
    <div style={{ fontFamily: FONT_SANS, color: '#1A1A2E', overflowX: 'hidden' }}>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav className="landing-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        background: '#e1b3ec',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <a href="/" style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 900, color: 'white', textDecoration: 'none', letterSpacing: -0.5 }}>
          Донирај<span style={{ color: '#fe613e' }}>.</span>мк
        </a>
        <a href="/" className="landing-nav-cta btn-cta" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', padding: '16px 32px', fontWeight: 600, fontSize: 14, textDecoration: 'none', textTransform: 'uppercase' }}>
          Започни со донација
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="landing-hero" style={{ background: '#FFF9F0', padding: '160px 24px 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <HandDrawnBorder color="#fe613e" seed={42} borderWidth={3} padding="10px 28px">
            <span style={{ fontFamily: FONT_SANS, fontWeight: 800, fontSize: 13, color: '#fe613e', letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'center', display: 'block' }}>
              Бесплатна платформа за донации
            </span>
          </HandDrawnBorder>
        </div>

        <p style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(40px, 10.2vw, 170px)', fontWeight: 700, color: '#0f52a1', lineHeight: 1.1, letterSpacing: -2, textAlign: 'center', maxWidth: 1100, margin: '0 auto 48px' }}>{"Подари го"}<img src="/igracki.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05) rotate(-7deg)', margin: '0 0.15em' }} />{"она"}<img src="/alista.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05) rotate(23deg)', margin: '0 0.15em' }} /><br />{"што"}<img src="/elektronika.svg" alt="" style={{ display: 'inline', height: '0.6em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.2)', margin: '0 0.15em' }} />{"не го користиш."}<br />{"Помогни некому."}<img src="/mebel.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05)', margin: '0 0.15em' }} /></p>

        <p style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, color: '#0f52a1', textAlign: 'center', lineHeight: 1.7, maxWidth: 533, margin: '0 auto 40px' }}>
          Донирај.мк е место каде облека, книги, играчки и мебел наоѓаат нов дом наместо ѓубишта. Бесплатно. Локално. Лесно.
        </p>

        <div className="hero-cta-buttons" style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <a href="/" className="btn-cta" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', textDecoration: 'none', padding: '16px 32px', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', display: 'inline-block' }}>Започни со донација</a>
          <a href="#how" className="btn-cta" style={{ fontFamily: FONT_SANS, background: 'transparent', color: '#0f52a1', textDecoration: 'none', padding: '14px 30px', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', display: 'inline-block', border: '2px solid #e1b3ec' }}>Дознај повеќе</a>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" style={{ background: '#FFF9F0', paddingTop: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fe613e', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>KAKO ФУНКЦИОНИРА</p>
          <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#0f52a1', letterSpacing: -1, margin: '0 0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Три чекори до донација</h2>
        </div>

        {/* Stripe 1 — Blue */}
        <div className="landing-stripe" style={{ background: '#0f52a1', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <HandDrawnBorder color="#fdc31c" seed={7} borderWidth={5} padding="0" style={{ width: 118, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/registriraj%20se.svg" alt="" style={{ width: 70, height: 64, objectFit: 'contain' }} />
          </HandDrawnBorder>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fdc31c', margin: '0 0 6px' }}>Регистрирај се</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#fff9f0', margin: '0 0.15em', lineHeight: 1.4 }}>Креирај профил за помалку од 30 секунди.</p>
          </div>
          <div className="landing-stripe-number" style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#fdc31c', lineHeight: 1, flexShrink: 0 }}>1</div>
        </div>

        {/* Stripe 2 — Lavender */}
        <div className="landing-stripe" style={{ background: '#e1b3ec', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <HandDrawnBorder color="#fe613e" seed={14} borderWidth={5} padding="0" style={{ width: 118, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/drugo.svg" alt="" style={{ width: 70, height: 64, objectFit: 'contain' }} />
          </HandDrawnBorder>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fff9f0', margin: '0 0 6px' }}>Објави донација</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4 }}>Сликај го производот, напиши краток опис и објави.</p>
          </div>
          <div className="landing-stripe-number" style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#0f52a1', lineHeight: 1, flexShrink: 0 }}>2</div>
        </div>

        {/* Stripe 3 — Yellow */}
        <div className="landing-stripe" style={{ background: '#fdc31c', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <HandDrawnBorder color="#0f52a1" seed={21} borderWidth={5} padding="0" style={{ width: 118, height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/elektronika.svg" alt="" style={{ width: 54, height: 66, objectFit: 'contain' }} />
          </HandDrawnBorder>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fff9f0', margin: '0 0 6px' }}>Поврзи се</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4 }}>Брзо стапи во контакт и подари.</p>
          </div>
          <div className="landing-stripe-number" style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#fff9f0', lineHeight: 1, flexShrink: 0 }}>3</div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section className="landing-categories" style={{ background: '#FFF9F0', position: 'relative', minHeight: 1060, padding: '80px 0 100px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fe613e', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>КАТЕГОРИИ</p>
          <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#0f52a1', letterSpacing: -1, margin: '0 0.15em', lineHeight: 1 }}>Што може да се донира?</h2>
        </div>

        {/* Desktop: scattered absolute layout */}
        <div className="categories-desktop">
          {/* Phone — Електроника */}
          <div style={{ position: 'absolute', top: 175, left: '11%', width: 196, height: 270, transform: 'rotate(-7.25deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/elektronika.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '40%', left: '30%', transform: 'translateX(-50%) rotate(-104deg)' }}><p style={IL}>Електроника</p></div>
          </div>
          <div style={{ position: 'absolute', top: 280, left: '34%', width: 219, height: 219, transform: 'rotate(6.72deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/igracki.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '58%', left: '50%', transform: 'translateX(-50%) translateY(-50%) rotate(2.29deg)' }}><p style={IL}>Играчки</p></div>
          </div>
          <div style={{ position: 'absolute', top: 195, left: '70%', width: 357, height: 209, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/knigi.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '10.93%', right: '51.59%', bottom: '70.46%', left: '22.57%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ ...IL, transform: 'rotate(10.26deg)' }}>Книги</p></div>
          </div>
          <div style={{ position: 'absolute', top: 580, right: '10%', width: 220, height: 295, transform: 'rotate(19.51deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/alista.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '50%', left: '44%', transform: 'translateX(-50%) translateY(-50%) rotate(16.89deg)' }}><p style={IL}>алишта</p></div>
          </div>
          <div style={{ position: 'absolute', top: 470, left: '56%', width: 256, height: 235, transform: 'rotate(5.51deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/drugo.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '51.55%', right: '52.96%', bottom: '20.45%', left: '11.98%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ ...IL, transform: 'rotate(-30.29deg)' }}>друго</p></div>
          </div>
          <div style={{ position: 'absolute', top: 580, left: '3%', width: 357, height: 222, transform: 'rotate(5.49deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/kujnski%20aprati.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '47.23%', right: '28.97%', bottom: '14.66%', left: '37.23%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ ...IL, transform: 'rotate(2.88deg)', whiteSpace: 'pre-line', textAlign: 'center' }}>{'кујнски\nапарати'}</p></div>
          </div>
          <div style={{ position: 'absolute', top: 610, left: '28%', width: 268, height: 278, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/mebel.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
            <div style={{ position: 'absolute', top: '11.2%', right: '16.74%', bottom: '56.67%', left: '65.65%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ ...IL, transform: 'rotate(-73.2deg)' }}>мебел</p></div>
          </div>
        </div>

        {/* Mobile: simple grid */}
        <div className="categories-mobile" style={{ display: 'none', marginTop: 32, padding: '0 16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { src: '/elektronika.svg', label: 'Електроника' },
              { src: '/igracki.svg',     label: 'Играчки' },
              { src: '/knigi.svg',       label: 'Книги' },
              { src: '/alista.svg',      label: 'Алишта' },
              { src: '/kujnski%20aprati.svg', label: 'Кујна' },
              { src: '/mebel.svg',       label: 'Мебел' },
              { src: '/drugo.svg',       label: 'Друго' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <img src={c.src} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
                <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#0f52a1' }}>{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ──────────────────────────────────────────────────────────── */}
      <section className="why-us-section" style={{ background: '#0f52a1', position: 'relative', padding: '100px 24px 120px' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fdc31c', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>ЗОШТО ДОНИРАЈ.МК</p>
            <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#fff9f0', letterSpacing: -1, margin: '0 0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Едноставно. Бесплатно. Локално.</h2>
          </div>

          <div className="feature-cards-grid" style={{ gap: 40 }}>
            {[
              { icon: '/besplatno.svg',           w: 101, h: 90,  title: 'Целосно бесплатно', desc: 'Нема скриени трошоци.\nДонирај и добивај без да платиш.', border: '#fe613e' },
              { icon: '/lokalno.svg',             w: 86,  h: 98,  title: 'Локално',           desc: 'Поврзи се со луѓе\nод твојот град или околина.',       border: '#e1b3ec' },
              { icon: '/brzo%20i%20lesno.svg',    w: 77,  h: 98,  title: 'Брзо и лесно',      desc: 'Објави оглас за помалку\nод 2 минути – со слика и опис.', border: '#fdc31c' },
              { icon: '/eco.svg',                 w: 112, h: 98,  title: 'Еко одговорно',     desc: 'Дај им нов живот на предметите\nнаместо да ги фрлаш.',   border: '#fe613e' },
            ].map((b: { icon: string; w: number; h: number; title: string; desc: string; border: string }, i) => (
              <HandDrawnBorder key={i} color={b.border} seed={i * 7 + 2} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <img src={b.icon} alt="" style={{ width: b.w, height: b.h, objectFit: 'contain' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 900, color: '#fe613e', margin: '0 0.15em' }}>{b.title}</h3>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{b.desc}</p>
                </div>
              </HandDrawnBorder>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section className="landing-cta-section" style={{ background: '#FFF9F0', backgroundImage: 'linear-gradient(rgba(253,195,28,0.35) 1px, transparent 1px), linear-gradient(to right, rgba(253,195,28,0.35) 1px, transparent 1px)', backgroundSize: '50px 50px', position: 'relative', padding: '240px 24px 260px', display: 'flex', justifyContent: 'center' }}>
        {/* Wave from blue section cutting into grid */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 80, background: 'linear-gradient(to bottom right, #0f52a1 49%, transparent 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', width: '100%', maxWidth: 1180 }}>
          {/* Lavender shadow offset */}
          <div className="cta-shadow" style={{ position: 'absolute', top: 37, left: 25, right: -25, bottom: -37, background: '#e1b3ec' }} />
          {/* Navy main box */}
          <div className="landing-cta-box" style={{ position: 'relative', background: '#0f52a1', border: '3px solid #fe613e', padding: '70px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
            <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(60px, 8vw, 112px)', fontWeight: 700, color: '#e1b3ec', letterSpacing: -1, margin: '0 0.15em', textAlign: 'center', lineHeight: 1 }}>
              Спремни за донирање?
            </h2>
            <p style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 500, color: '#fdc31c', textAlign: 'center', margin: '0 0.15em', maxWidth: 566, lineHeight: 1.6 }}>
              Придружи се на заедницата која верува дека секој предмет заслужува втор живот.
            </p>
            <a href="/" className="btn-cta" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', padding: '16px 32px', fontWeight: 600, fontSize: 14, textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block' }}>
              Започни со донација
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="landing-footer" style={{ background: '#fdc31c', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 900, color: 'white' }}>
          Донирај<span style={{ color: '#fe613e' }}>.</span>мк
        </div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: '#fff9f0' }}>
          © 2025 Донирај.мк. Сите права задржани
        </div>
      </footer>

    </div>
  );
}
