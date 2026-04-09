'use client';
import { useId } from 'react';

export function HandDrawnBorder({ color, children, style, seed = 2, borderWidth = 16, padding = '40px 34px' }: {
  color: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
  seed?: number;
  borderWidth?: number;
  padding?: string;
}) {
  const rawId = useId().replace(/:/g, '');

  return (
    <div style={{ position: 'relative', background: '#fff9f0', overflow: 'visible', ...style }}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          <filter id={`rough-${rawId}`}>
            <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3" result="noise" seed={seed} />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      <div style={{
        position: 'absolute',
        inset: `-${Math.round(borderWidth / 2)}px`,
        border: `${borderWidth}px solid ${color}`,
        borderRadius: '4px',
        filter: `url(#rough-${rawId})`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, padding }}>
        {children}
      </div>
    </div>
  );
}
