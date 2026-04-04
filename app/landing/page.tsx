'use client';

import React from 'react';

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
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        background: '#e1b3ec',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <a href="/" style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 900, color: 'white', textDecoration: 'none', letterSpacing: -0.5 }}>
          Донирај<span style={{ color: '#fe613e' }}>.</span>мк
        </a>
        <a href="/" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', padding: '16px 32px', fontWeight: 600, fontSize: 14, textDecoration: 'none', textTransform: 'uppercase' }}>
          Започни со донација
        </a>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFF9F0', padding: '160px 24px 80px' }}>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <div style={{ background: '#FFF9F0', border: '2px solid #fe613e', padding: '14px 42px' }}>
            <span style={{ fontFamily: FONT_SANS, fontWeight: 800, fontSize: 13, color: '#fe613e', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Бесплатна платформа за донации
            </span>
          </div>
        </div>

        <p style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(60px, 10.2vw, 147px)', fontWeight: 700, color: '#0f52a1', lineHeight: 1.1, letterSpacing: -2, textAlign: 'center', maxWidth: 1100, margin: '0 auto 48px' }}>{"Подари го"}<img src="/igracki.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05) rotate(-7deg)', margin: '0 0.15em' }} />{"она"}<img src="/alista.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05) rotate(23deg)', margin: '0 0.15em' }} /><br />{"што"}<img src="/elektronika.svg" alt="" style={{ display: 'inline', height: '0.6em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.2)', margin: '0 0.15em' }} />{"не го користиш."}<br />{"Помогни некому."}<img src="/mebel.svg" alt="" style={{ display: 'inline', height: '0.8em', width: 'auto', verticalAlign: 'middle', transform: 'scale(1.05)', margin: '0 0.15em' }} /></p>

        <p style={{ fontFamily: FONT_SANS, fontWeight: 500, fontSize: 18, color: '#0f52a1', textAlign: 'center', lineHeight: 1.7, maxWidth: 533, margin: '0 auto 40px' }}>
          Донирај.мк е место каде облека, книги, играчки и мебел наоѓаат нов дом наместо ѓубишта. Бесплатно. Локално. Лесно.
        </p>

        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <a href="/" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', textDecoration: 'none', padding: '16px 32px', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', display: 'inline-block' }}>Започни со донација</a>
          <a href="#how" style={{ fontFamily: FONT_SANS, background: 'transparent', color: '#0f52a1', textDecoration: 'none', padding: '14px 30px', fontWeight: 600, fontSize: 14, textTransform: 'uppercase', display: 'inline-block', border: '2px solid #e1b3ec' }}>Дознај повеќе</a>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" style={{ background: '#FFF9F0', paddingTop: 80 }}>
        <div style={{ textAlign: 'center', marginBottom: 48, padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fe613e', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>KAKO ФУНКЦИОНИРА</p>
          <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#0f52a1', letterSpacing: -1, margin: '0 0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Три чекори до донација</h2>
        </div>

        {/* Stripe 1 — Blue */}
        <div style={{ background: '#0f52a1', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <div style={{ width: 118, height: 110, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/registriraj%20se.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fdc31c', margin: '0 0 6px' }}>Регистрирај се</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#fff9f0', margin: '0 0.15em', lineHeight: 1.4 }}>Креирај профил за помалку од 30 секунди.</p>
          </div>
          <div style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#fdc31c', lineHeight: 1, flexShrink: 0 }}>1</div>
        </div>

        {/* Stripe 2 — Lavender */}
        <div style={{ background: '#e1b3ec', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <div style={{ width: 118, height: 110, background: '#fff9f0', border: '5px solid #fe613e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/drugo.svg" alt="" style={{ width: 70, height: 64, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fff9f0', margin: '0 0 6px' }}>Објави донација</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4 }}>Сликај го производот, напиши краток опис и објави.</p>
          </div>
          <div style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#0f52a1', lineHeight: 1, flexShrink: 0 }}>2</div>
        </div>

        {/* Stripe 3 — Yellow */}
        <div style={{ background: '#fdc31c', display: 'flex', alignItems: 'center', gap: 32, padding: '50px clamp(24px, 12%, 176px)' }}>
          <div style={{ width: 118, height: 110, background: '#fff9f0', border: '5px solid #0f52a1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/alista.svg" alt="" style={{ width: 54, height: 66, objectFit: 'contain' }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontFamily: FONT_SANS, fontSize: 24, fontWeight: 900, color: '#fff9f0', margin: '0 0 6px' }}>Поврзи се</h3>
            <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4 }}>Брзо стапи во контакт и подари.</p>
          </div>
          <div style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(80px, 9vw, 128px)', fontWeight: 700, color: '#fff9f0', lineHeight: 1, flexShrink: 0 }}>3</div>
        </div>
      </section>

      {/* ── CATEGORIES ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFF9F0', position: 'relative', minHeight: 1060, padding: '80px 0 100px', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fe613e', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>KAKO ФУНКЦИОНИРА</p>
          <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#0f52a1', letterSpacing: -1, margin: '0 0.15em', lineHeight: 1 }}>Што може да се донира?</h2>
        </div>

        {/* Phone — Електроника */}
        <div style={{ position: 'absolute', top: 175, left: '11%', width: 196, height: 270, transform: 'rotate(-7.25deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/elektronika.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '40%', left: '30%', transform: 'translateX(-50%) rotate(-104deg)' }}>
            <p style={IL}>Електроника</p>
          </div>
        </div>

        {/* Teddy — Играчки */}
        <div style={{ position: 'absolute', top: 280, left: '34%', width: 219, height: 219, transform: 'rotate(6.72deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/igracki.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '58%', left: '50%', transform: 'translateX(-50%) translateY(-50%) rotate(2.29deg)' }}>
            <p style={IL}>Играчки</p>
          </div>
        </div>

        {/* Book — Книги */}
        <div style={{ position: 'absolute', top: 195, left: '70%', width: 357, height: 209, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/knigi.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '10.93%', right: '51.59%', bottom: '70.46%', left: '22.57%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ ...IL, transform: 'rotate(10.26deg)' }}>Книги</p>
          </div>
        </div>

        {/* T-shirt — Алишта */}
        <div style={{ position: 'absolute', top: 600, right: '10%', width: 169, height: 227, transform: 'rotate(23.51deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/alista.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translateX(-50%) translateY(-50%) rotate(16.89deg)' }}>
            <p style={IL}>алишта</p>
          </div>
        </div>

        {/* Box — Друго */}
        <div style={{ position: 'absolute', top: 470, left: '56%', width: 256, height: 235, transform: 'rotate(5.51deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/drugo.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '51.55%', right: '52.96%', bottom: '20.45%', left: '11.98%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ ...IL, transform: 'rotate(-30.29deg)' }}>друго</p>
          </div>
        </div>

        {/* Pot — Кујнски */}
        <div style={{ position: 'absolute', top: 580, left: '3%', width: 357, height: 222, transform: 'rotate(5.49deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/kujnski%20aprati.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '47.23%', right: '28.97%', bottom: '14.66%', left: '37.23%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ ...IL, transform: 'rotate(2.88deg)', whiteSpace: 'pre-line', textAlign: 'center' }}>{'кујнски\nапарати'}</p>
          </div>
        </div>

        {/* Chair — Мебел */}
        <div style={{ position: 'absolute', top: 610, left: '28%', width: 268, height: 278, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/mebel.svg" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          <div style={{ position: 'absolute', top: '11.2%', right: '16.74%', bottom: '56.67%', left: '65.65%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ ...IL, transform: 'rotate(-73.2deg)' }}>мебел</p>
          </div>
        </div>
      </section>

      {/* ── WHY US ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0f52a1', position: 'relative', padding: '100px 24px 120px', overflow: 'hidden' }}>
        {/* Wave decoration */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: 60, background: 'linear-gradient(to bottom right, transparent 49%, #FFF9F0 50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 100 }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: '#fdc31c', letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 14px' }}>ЗОШТО ДОНИРАЈ.МК</p>
            <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(48px, 5.3vw, 76px)', fontWeight: 700, color: '#fff9f0', letterSpacing: -1, margin: '0 0.15em', textTransform: 'uppercase', lineHeight: 1 }}>Едноставно. Бесплатно. Локално.</h2>
          </div>

          <div style={{ display: 'flex', gap: 56, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: '/besplatno.svg',           w: 101, h: 90,  title: 'Целосно бесплатно', desc: 'Нема скриени трошоци.\nДонирај и добивај без да платиш.', border: '#fe613e' },
              { icon: '/lokalno.svg',             w: 86,  h: 98,  title: 'Локално',           desc: 'Поврзи се со луѓе\nод твојот град или околина.',       border: '#e1b3ec' },
              { icon: '/brzo%20i%20lesno.svg',    w: 77,  h: 98,  title: 'Брзо и лесно',      desc: 'Објави оглас за помалку\nод 2 минути – со слика и опис.', border: '#fdc31c' },
              { icon: '/eco.svg',                 w: 112, h: 98,  title: 'Еко одговорно',     desc: 'Дај им нов живот на предметите\nнаместо да ги фрлаш.',   border: '#fe613e' },
            ].map((b: { icon: string; w: number; h: number; title: string; desc: string; border: string }, i) => (
              <div key={i} style={{ background: '#fff9f0', border: `18px solid ${b.border}`, width: 270, flexShrink: 0, padding: '50px 34px', display: 'flex', flexDirection: 'column', gap: 32 }}>
                <img src={b.icon} alt="" style={{ width: b.w, height: b.h, objectFit: 'contain' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <h3 style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 900, color: '#fe613e', margin: '0 0.15em' }}>{b.title}</h3>
                  <p style={{ fontFamily: FONT_SANS, fontSize: 20, fontWeight: 500, color: '#0f52a1', margin: '0 0.15em', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section style={{ background: '#FFF9F0', padding: '80px 24px 100px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: 1180 }}>
          {/* Lavender shadow offset */}
          <div style={{ position: 'absolute', top: 37, left: 25, right: -25, bottom: -37, background: '#e1b3ec' }} />
          {/* Navy main box */}
          <div style={{ position: 'relative', background: '#0f52a1', border: '3px solid #fe613e', padding: '70px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40 }}>
            <h2 style={{ fontFamily: FONT_AMATIC, fontSize: 'clamp(60px, 8vw, 112px)', fontWeight: 700, color: '#e1b3ec', letterSpacing: -1, margin: '0 0.15em', textAlign: 'center', lineHeight: 1 }}>
              Спремни за донирање?
            </h2>
            <p style={{ fontFamily: FONT_SANS, fontSize: 18, fontWeight: 500, color: '#fdc31c', textAlign: 'center', margin: '0 0.15em', maxWidth: 566, lineHeight: 1.6 }}>
              Придружи се на заедницата која верува дека секој предмет заслужува втор живот.
            </p>
            <a href="/" style={{ fontFamily: FONT_SANS, background: '#fe613e', color: 'white', padding: '16px 32px', fontWeight: 600, fontSize: 14, textDecoration: 'none', textTransform: 'uppercase', display: 'inline-block' }}>
              Започни со донација
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#fdc31c', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
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
