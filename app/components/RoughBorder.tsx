'use client';
import { useEffect, useRef, useState } from 'react';
import rough from 'roughjs';

export function RoughBorder({ color, children, style }: {
  color: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!wrapRef.current) return;
    const obs = new ResizeObserver(([e]) => {
      setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
    obs.observe(wrapRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !size.w || !size.h) return;
    const rc = rough.svg(svgRef.current);
    const pad = 6;
    const node = rc.rectangle(pad, pad, size.w - pad * 2, size.h - pad * 2, {
      stroke: color,
      strokeWidth: 3,
      roughness: 4,
      bowing: 2,
      fill: 'none',
      seed: 5,
      disableMultiStroke: false,
    });
    svgRef.current.innerHTML = '';
    svgRef.current.appendChild(node);
  }, [color, size]);

  return (
    <div ref={wrapRef} style={{ position: 'relative', background: '#fff9f0', overflow: 'visible', ...style }}>
      <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }} />
      <div style={{ position: 'relative', zIndex: 1, padding: '40px 34px' }}>
        {children}
      </div>
    </div>
  );
}
