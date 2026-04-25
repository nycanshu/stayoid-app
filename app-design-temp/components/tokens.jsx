// Design tokens + helpers for Stayoid mobile
// Light/dark/soft-vs-bordered are controlled via a "mode" object passed down

const stayTokens = (mode) => {
  const dark = mode.theme === 'dark';
  const bordered = mode.card === 'bordered';
  return {
    dark,
    bordered,
    bg:          dark ? '#0E0E0D' : '#F4F2EE',
    surface:     dark ? '#181816' : '#FFFFFF',
    surfaceAlt:  dark ? '#121210' : '#EFEDE8',
    text:        dark ? '#F1EFE9' : '#111110',
    textDim:     dark ? 'rgba(241,239,233,0.62)' : 'rgba(17,17,16,0.58)',
    textFaint:   dark ? 'rgba(241,239,233,0.38)' : 'rgba(17,17,16,0.35)',
    border:      dark ? 'rgba(241,239,233,0.10)' : 'rgba(17,17,16,0.09)',
    borderStrong:dark ? 'rgba(241,239,233,0.20)' : 'rgba(17,17,16,0.18)',
    accent:      dark ? '#8BB8A3' : '#2E5D48',     // muted evergreen
    accentSoft:  dark ? 'rgba(139,184,163,0.18)' : 'rgba(46,93,72,0.10)',
    warn:        dark ? '#D6A35C' : '#8C6316',
    warnSoft:    dark ? 'rgba(214,163,92,0.18)' : 'rgba(140,99,22,0.10)',
    danger:      dark ? '#D68A7A' : '#A3442E',
    chipBg:      dark ? 'rgba(241,239,233,0.06)' : 'rgba(17,17,16,0.045)',
    cardShadow:  bordered ? 'none' :
                 (dark ? '0 1px 0 rgba(255,255,255,0.02), 0 8px 24px rgba(0,0,0,0.30)'
                       : '0 1px 0 rgba(17,17,16,0.02), 0 6px 20px rgba(17,17,16,0.045)'),
    cardBorder:  bordered ? (dark ? '1px solid rgba(241,239,233,0.12)' : '1px solid rgba(17,17,16,0.10)') : 'none',
  };
};

// Shared base styles
const stayFont = `'Inter', -apple-system, system-ui, sans-serif`;
const staySerif = `'Instrument Serif', 'Cormorant Garamond', Georgia, serif`;
const stayMono = `'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace`;

// Small reusable card
function StayCard({ t, children, style = {}, pad = 18, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: t.surface,
      borderRadius: 20,
      padding: pad,
      boxShadow: t.cardShadow,
      border: t.cardBorder,
      cursor: onClick ? 'pointer' : undefined,
      ...style,
    }}>{children}</div>
  );
}

// Uppercase mono label
function StayLabel({ t, children, style = {} }) {
  return (
    <div style={{
      fontFamily: stayMono,
      fontSize: 10.5,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: t.textDim,
      fontWeight: 500,
      ...style,
    }}>{children}</div>
  );
}

// Expressive serif number
function StayNumber({ t, value, unit, size = 56, color, style = {} }) {
  return (
    <div style={{
      fontFamily: staySerif,
      fontSize: size,
      lineHeight: 0.95,
      letterSpacing: -0.5,
      color: color || t.text,
      fontWeight: 400,
      display: 'flex',
      alignItems: 'baseline',
      gap: 4,
      ...style,
    }}>
      {value}
      {unit && <span style={{ fontSize: size * 0.36, color: t.textDim, fontFamily: stayFont, fontWeight: 500, letterSpacing: 0 }}>{unit}</span>}
    </div>
  );
}

// Simple icon (stroked)
function StayIcon({ name, size = 18, color = 'currentColor', strokeWidth = 1.6 }) {
  const s = size, c = color, sw = strokeWidth;
  const paths = {
    home: <><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1V10z"/></>,
    building: <><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
    bed: <><path d="M3 18V8M3 14h18v4M21 14V11a3 3 0 00-3-3H8"/><circle cx="7" cy="12" r="2"/></>,
    users: <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6M17 10a3 3 0 100-6M22 20c0-2.6-1.8-4.8-4.5-5.5"/></>,
    wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M17 15h2"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    bell: <><path d="M6 16V10a6 6 0 0112 0v6l2 2H4l2-2zM10 20a2 2 0 004 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></>,
    chev: <><path d="M9 6l6 6-6 6"/></>,
    chevDown: <><path d="M6 9l6 6 6-6"/></>,
    arrowUp: <><path d="M7 17L17 7M17 7H8M17 7v9"/></>,
    arrowDown: <><path d="M17 7L7 17M7 17h9M7 17V8"/></>,
    arrowRight: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    back: <><path d="M19 12H5M11 18l-6-6 6-6"/></>,
    close: <><path d="M6 6l12 12M18 6L6 18"/></>,
    check: <><path d="M4 12l5 5L20 6"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    camera: <><rect x="3" y="7" width="18" height="13" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/></>,
    phone: <><path d="M5 4h3l2 5-2 1a10 10 0 006 6l1-2 5 2v3a2 2 0 01-2 2A17 17 0 013 6a2 2 0 012-2z"/></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="M3 7l9 7 9-7"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    dot: <><circle cx="12" cy="12" r="3"/></>,
    upload: <><path d="M12 15V4M7 9l5-5 5 5M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2"/></>,
    pin: <><path d="M12 22s7-7 7-12a7 7 0 00-14 0c0 5 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></>,
    receipt: <><path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3"/></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16"/></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    sort: <><path d="M7 4v16M3 8l4-4 4 4M17 20V4M13 16l4 4 4-4"/></>,
    trendUp: <><path d="M3 17l6-6 4 4 8-8M15 7h6v6"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

Object.assign(window, { stayTokens, stayFont, staySerif, stayMono, StayCard, StayLabel, StayNumber, StayIcon });
