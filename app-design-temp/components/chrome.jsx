// Bottom nav — iOS + Android share this; visual tweaks per platform

function StayBottomNav({ t, active, onChange, platform = 'ios' }) {
  const items = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'props', label: 'Properties', icon: 'building' },
    { id: 'tenants', label: 'Tenants', icon: 'users' },
    { id: 'pay', label: 'Payments', icon: 'wallet' },
  ];
  const iosTop = platform === 'ios';
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: iosTop ? 26 : 22,
      paddingTop: 10,
      background: t.dark
        ? 'linear-gradient(to top, rgba(14,14,13,0.95) 60%, rgba(14,14,13,0.7) 85%, transparent)'
        : 'linear-gradient(to top, rgba(244,242,238,0.96) 60%, rgba(244,242,238,0.75) 85%, transparent)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 40,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0 8px',
      }}>
        {items.map(it => {
          const isA = active === it.id;
          return (
            <div key={it.id} onClick={() => onChange(it.id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 12px', cursor: 'pointer',
              color: isA ? t.text : t.textFaint,
              transition: 'color 200ms',
            }}>
              <StayIcon name={it.icon} size={22} strokeWidth={isA ? 1.9 : 1.5} />
              <div style={{
                fontFamily: stayFont, fontSize: 10.5, letterSpacing: 0.1,
                fontWeight: isA ? 600 : 500,
              }}>{it.label}</div>
              {isA && <div style={{ width: 4, height: 4, borderRadius: 2, background: t.text, marginTop: 1 }}/>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Subtle top greeting header (non-iOS-NavBar variant, used inside our own scroll area)
function StayAppHeader({ t, title, subtitle, right, style = {} }) {
  return (
    <div style={{
      padding: '4px 20px 18px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 12,
      ...style,
    }}>
      <div style={{ minWidth: 0 }}>
        {subtitle && <StayLabel t={t} style={{ marginBottom: 8 }}>{subtitle}</StayLabel>}
        <div style={{
          fontFamily: staySerif, fontSize: 34, lineHeight: 1.02, letterSpacing: -0.5,
          color: t.text, fontWeight: 400,
        }}>{title}</div>
      </div>
      {right}
    </div>
  );
}

// Segmented switch (used in Tenants / Payments / Beds)
function StaySegmented({ t, options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex', background: t.chipBg, borderRadius: 999,
      padding: 3, gap: 2,
    }}>
      {options.map(o => {
        const a = value === o.value;
        return (
          <div key={o.value} onClick={() => onChange(o.value)} style={{
            padding: '7px 14px', borderRadius: 999,
            fontFamily: stayFont, fontSize: 12.5, fontWeight: 600,
            background: a ? t.surface : 'transparent',
            color: a ? t.text : t.textDim,
            boxShadow: a ? (t.dark ? '0 1px 2px rgba(0,0,0,0.4)' : '0 1px 2px rgba(0,0,0,0.06)') : 'none',
            cursor: 'pointer',
          }}>{o.label}</div>
        );
      })}
    </div>
  );
}

// Avatar — initials on tinted background
function StayAvatar({ initials, size = 40, tone = '#2E5D48', t, dark }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: tone + '20',
      color: tone,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: stayFont, fontWeight: 600, fontSize: size * 0.36,
      letterSpacing: 0.2,
      flexShrink: 0,
      border: '1px solid ' + tone + '28',
    }}>{initials}</div>
  );
}

// Status pill (for tenant rows, payments)
function StayPill({ t, label, tone = 'neutral' }) {
  const tones = {
    ok:   { bg: t.accentSoft, fg: t.accent },
    warn: { bg: t.warnSoft,   fg: t.warn },
    bad:  { bg: t.dark ? 'rgba(214,138,122,0.18)' : 'rgba(163,68,46,0.10)', fg: t.danger },
    neutral:{ bg: t.chipBg, fg: t.textDim },
  };
  const c = tones[tone];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 9px', borderRadius: 100,
      background: c.bg, color: c.fg,
      fontFamily: stayFont, fontSize: 11, fontWeight: 600,
      letterSpacing: 0.1,
    }}>
      <div style={{ width: 5, height: 5, borderRadius: 3, background: c.fg }}/>
      {label}
    </div>
  );
}

// Progress meter (segmented)
function StayMeter({ t, value, total, height = 8, tone }) {
  const pct = total ? (value / total) * 100 : 0;
  const c = tone || t.accent;
  return (
    <div style={{
      width: '100%', height, borderRadius: height/2,
      background: t.chipBg, overflow: 'hidden',
    }}>
      <div style={{
        width: `${Math.min(100, pct)}%`, height: '100%',
        background: c, borderRadius: height/2,
        transition: 'width 400ms',
      }}/>
    </div>
  );
}

// Format currency (INR, compact-ish)
function fmtINR(n, { compact = false } = {}) {
  if (n == null) return '₹0';
  if (compact && n >= 100000) return '₹' + (n/100000).toFixed(n%100000 === 0 ? 0 : 1) + 'L';
  if (compact && n >= 1000)   return '₹' + (n/1000).toFixed(n%1000 === 0 ? 0 : 1) + 'k';
  return '₹' + n.toLocaleString('en-IN');
}

Object.assign(window, {
  StayBottomNav, StayAppHeader, StaySegmented, StayAvatar, StayPill, StayMeter, fmtINR,
});
