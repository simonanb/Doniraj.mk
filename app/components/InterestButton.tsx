'use client';

interface InterestButtonProps {
  isLiked: boolean;
  onToggle: () => void;
  size?: 'sm' | 'lg';
  disabled?: boolean;
}

function HeartIcon({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export default function InterestButton({
  isLiked,
  onToggle,
  size = 'sm',
  disabled = false,
}: InterestButtonProps) {
  const sm = size === 'sm';
  const bg = isLiked ? '#6340CC' : '#7B4FFF';
  const hoverBg = isLiked ? '#5230BB' : '#6340CC';

  return (
    <button
      onClick={e => {
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
      aria-label={isLiked ? 'Отстрани интерес' : 'Покажи интерес'}
      aria-pressed={isLiked}
      disabled={disabled}
      style={{
        background: bg,
        color: 'white',
        border: 'none',
        borderRadius: 9999,
        padding: sm ? '7px 14px' : '14px 24px',
        fontSize: sm ? 13 : 15,
        fontWeight: 800,
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
        width: sm ? undefined : '100%',
        transition: 'background 0.15s, opacity 0.15s',
        opacity: disabled ? 0.5 : 1,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = bg; }}
    >
      <HeartIcon filled={isLiked} size={sm ? 14 : 16} />
      Интерес
    </button>
  );
}
