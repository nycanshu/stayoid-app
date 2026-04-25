// Screens 1–5: Dashboard, Properties, Property Detail, Tenants, Tenant Detail

// ─────────────────── DASHBOARD ───────────────────
function StayDashboard({ t, empty, onOpenProp, onNav, onAddProp }) {
  const T = STAY_TOTALS;
  const totals = empty
    ? { properties: 0, beds: 0, occupied: 0, vacant: 0, revenueTarget: 0, revenueCollected: 0, activeTenants: 0, month: T.month }
    : T;
  const collectedPct = totals.revenueTarget ? Math.round(totals.revenueCollected / totals.revenueTarget * 100) : 0;
  const occPct = totals.beds ? Math.round(totals.occupied / totals.beds * 100) : 0;

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* greeting */}
      <div style={{ padding: '8px 20px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <StayLabel t={t} style={{ marginBottom: 10 }}>Monday · Apr 20</StayLabel>
          <div style={{
            fontFamily: staySerif, fontSize: 36, lineHeight: 1, letterSpacing: -0.6,
            color: t.text, fontWeight: 400,
          }}>
            Morning,<br/><span style={{ fontStyle: 'italic', color: t.accent }}>Himanshu</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div onClick={() => onNav('notifs')} style={{
            width: 40, height: 40, borderRadius: 20, background: t.chipBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: t.text, cursor: 'pointer', position: 'relative',
          }}>
            <StayIcon name="bell" size={18}/>
            {!empty && <div style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, background: t.danger, border: '1.5px solid ' + t.bg }}/>}
          </div>
          <div onClick={() => onNav('profile')} style={{
            width: 40, height: 40, borderRadius: 20,
            background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: stayFont, fontWeight: 600, fontSize: 14,
            cursor: 'pointer',
          }}>HK</div>
        </div>
      </div>

      {/* HERO revenue card — expressive serif */}
      <div style={{ padding: '0 16px 14px' }}>
        <StayCard t={t} pad={22}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <StayLabel t={t} style={{ marginBottom: 4 }}>Rent collection</StayLabel>
              <div style={{ fontFamily: stayFont, fontSize: 13, color: t.textDim }}>{totals.month}</div>
            </div>
            {!empty && (
              <div style={{
                padding: '4px 10px', borderRadius: 100, background: t.accentSoft,
                color: t.accent, fontFamily: stayFont, fontSize: 11.5, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <StayIcon name="trendUp" size={12} strokeWidth={2}/> {collectedPct}% collected
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <StayNumber t={t} value={fmtINR(totals.revenueCollected, { compact: true })} size={64}/>
            <div style={{ textAlign: 'right', paddingBottom: 6 }}>
              <div style={{ fontFamily: stayFont, fontSize: 11, color: t.textFaint, textTransform: 'uppercase', letterSpacing: 1 }}>of</div>
              <div style={{ fontFamily: stayFont, fontSize: 16, color: t.textDim, fontWeight: 500 }}>{fmtINR(totals.revenueTarget, { compact: true })}</div>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <StayMeter t={t} value={totals.revenueCollected} total={totals.revenueTarget || 1}/>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, fontFamily: stayFont, fontSize: 12.5 }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: t.accent }}/>
                <span style={{ color: t.text, fontWeight: 600 }}>{empty ? 0 : 52}</span>
                <span style={{ color: t.textDim }}>paid</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: t.textFaint }}/>
                <span style={{ color: t.text, fontWeight: 600 }}>{empty ? 0 : 6}</span>
                <span style={{ color: t.textDim }}>pending</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: 4, background: t.danger }}/>
                <span style={{ color: t.text, fontWeight: 600 }}>{empty ? 0 : 2}</span>
                <span style={{ color: t.textDim }}>overdue</span>
              </div>
            </div>
          </div>
        </StayCard>
      </div>

      {/* 2x2 mini stats */}
      <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <StatTile t={t} label="Properties" value={totals.properties} sub={`${totals.beds} total beds`} />
        <StatTile t={t} label="Occupancy" value={`${occPct}%`} sub={`${totals.occupied} of ${totals.beds}`} meter={{ v: totals.occupied, total: totals.beds || 1 }} />
        <StatTile t={t} label="Active tenants" value={totals.activeTenants} sub={`${totals.vacant} vacant beds`} />
        <StatTile t={t} label="Today" value={empty ? '—' : '₹22.5k'} sub={empty ? 'no payments' : '2 payments'} tone="accent" />
      </div>

      {/* Your properties — horizontal rhythm */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '18px 20px 12px' }}>
        <div style={{ fontFamily: staySerif, fontSize: 22, color: t.text, letterSpacing: -0.2 }}>Your properties</div>
        <div onClick={() => onNav('props')} style={{ fontFamily: stayFont, fontSize: 13, color: t.accent, fontWeight: 600, cursor: 'pointer' }}>See all</div>
      </div>

      {empty ? (
        <div style={{ padding: '0 16px' }}>
          <StayCard t={t} pad={28} style={{ textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 28, margin: '0 auto 14px',
              background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.textDim,
            }}>
              <StayIcon name="building" size={24}/>
            </div>
            <div style={{ fontFamily: staySerif, fontSize: 22, color: t.text, marginBottom: 6 }}>No properties yet</div>
            <div style={{ fontFamily: stayFont, fontSize: 13.5, color: t.textDim, lineHeight: 1.5, marginBottom: 16 }}>
              Add your first property to start tracking rent, beds, and tenants.
            </div>
            <div onClick={onAddProp} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '12px 18px', borderRadius: 100,
              background: t.text, color: t.bg,
              fontFamily: stayFont, fontSize: 13.5, fontWeight: 600,
              cursor: 'pointer',
            }}>
              <StayIcon name="plus" size={15} strokeWidth={2.2}/> Add property
            </div>
          </StayCard>
        </div>
      ) : (
        <div style={{
          display: 'flex', gap: 12, overflowX: 'auto', padding: '0 16px 4px',
          scrollbarWidth: 'none',
        }}>
          {STAY_PROPERTIES.map(p => <PropCard key={p.id} t={t} p={p} onClick={() => onOpenProp(p)} />)}
        </div>
      )}

      {/* Activity */}
      <div style={{ padding: '26px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: staySerif, fontSize: 22, color: t.text, letterSpacing: -0.2 }}>Recent activity</div>
        <div onClick={() => onNav('pay')} style={{ fontFamily: stayFont, fontSize: 13, color: t.accent, fontWeight: 600, cursor: 'pointer' }}>Payments</div>
      </div>
      <div style={{ padding: '0 16px' }}>
        <StayCard t={t} pad={0}>
          {empty ? (
            <div style={{ padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontFamily: stayFont, fontSize: 13.5, color: t.textDim }}>Activity will appear here once you add tenants.</div>
            </div>
          ) : (
            STAY_PAYMENTS.slice(0, 4).map((p, i) => (
              <div key={p.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px',
                borderTop: i === 0 ? 'none' : '1px solid ' + t.border,
              }}>
                <StayAvatar initials={p.who.split(' ').map(s => s[0]).join('').slice(0,2)} size={36} tone={t.accent} t={t}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: stayFont, fontSize: 14, fontWeight: 600, color: t.text }}>{p.who}</div>
                  <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginTop: 2 }}>{p.when} · {p.method}</div>
                </div>
                <div style={{ fontFamily: staySerif, fontSize: 20, color: t.text, letterSpacing: -0.2 }}>{fmtINR(p.amount)}</div>
              </div>
            ))
          )}
        </StayCard>
      </div>
    </div>
  );
}

function StatTile({ t, label, value, sub, meter, tone }) {
  const isAccent = tone === 'accent';
  return (
    <div style={{
      background: isAccent ? t.accent : t.surface,
      color: isAccent ? '#fff' : t.text,
      borderRadius: 20, padding: 16,
      boxShadow: t.cardShadow, border: t.cardBorder,
      minHeight: 104, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    }}>
      <div style={{
        fontFamily: stayMono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase',
        color: isAccent ? 'rgba(255,255,255,0.75)' : t.textDim, fontWeight: 500,
      }}>{label}</div>
      <div>
        <div style={{
          fontFamily: staySerif, fontSize: 34, lineHeight: 1, letterSpacing: -0.5,
          color: isAccent ? '#fff' : t.text,
        }}>{value}</div>
        {meter && (
          <div style={{ marginTop: 8 }}>
            <div style={{ height: 4, borderRadius: 2, background: isAccent ? 'rgba(255,255,255,0.25)' : t.chipBg }}>
              <div style={{ width: `${(meter.v/meter.total)*100}%`, height: 4, borderRadius: 2, background: isAccent ? '#fff' : t.accent }}/>
            </div>
          </div>
        )}
        <div style={{
          fontFamily: stayFont, fontSize: 11.5, marginTop: 6,
          color: isAccent ? 'rgba(255,255,255,0.75)' : t.textDim,
        }}>{sub}</div>
      </div>
    </div>
  );
}

function PropCard({ t, p, onClick }) {
  const pct = Math.round((p.occupied / p.beds) * 100);
  const collPct = Math.round((p.collected / p.monthly) * 100);
  return (
    <div onClick={onClick} style={{
      width: 220, flexShrink: 0,
      background: t.surface, borderRadius: 20, padding: 16,
      boxShadow: t.cardShadow, border: t.cardBorder,
      cursor: 'pointer',
    }}>
      <div style={{
        height: 84, borderRadius: 14, marginBottom: 14,
        background: `linear-gradient(135deg, ${p.tone} 0%, ${p.tone}cc 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,0.06) 14px 15px)',
        }}/>
        <div style={{
          position: 'absolute', bottom: 8, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div style={{ fontFamily: stayMono, fontSize: 9.5, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase' }}>{p.type}</div>
          <div style={{ fontFamily: staySerif, fontSize: 26, color: '#fff', lineHeight: 1 }}>{pct}%</div>
        </div>
      </div>
      <div style={{ fontFamily: staySerif, fontSize: 18, color: t.text, letterSpacing: -0.2, marginBottom: 2 }}>{p.name}</div>
      <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginBottom: 12 }}>{p.address}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: stayMono, fontSize: 9.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Beds</div>
          <div style={{ fontFamily: stayFont, fontSize: 14, fontWeight: 600, color: t.text }}>{p.occupied}/{p.beds}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: stayMono, fontSize: 9.5, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase' }}>Collected</div>
          <div style={{ fontFamily: stayFont, fontSize: 14, fontWeight: 600, color: collPct >= 90 ? t.accent : t.text }}>{collPct}%</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────── PROPERTIES LIST ───────────────────
function StayProperties({ t, empty, onOpenProp, onAddProp }) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <StayAppHeader t={t} title="Properties" subtitle={empty ? '0 properties' : `${STAY_PROPERTIES.length} properties · ${STAY_TOTALS.beds} beds`}
        right={
          <div onClick={onAddProp} style={{
            width: 40, height: 40, borderRadius: 20, background: t.text, color: t.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}>
            <StayIcon name="plus" size={18} strokeWidth={2.2}/>
          </div>
        }
      />

      <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', borderRadius: 100, background: t.chipBg,
        }}>
          <StayIcon name="search" size={15} color={t.textDim}/>
          <div style={{ fontFamily: stayFont, fontSize: 13, color: t.textFaint }}>Search properties</div>
        </div>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: t.chipBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.textDim,
        }}>
          <StayIcon name="filter" size={16}/>
        </div>
      </div>

      {empty ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState t={t} icon="building" title="No properties yet"
            body="Add your first property, set up beds, and start collecting rent in under 2 minutes."
            cta={{ label: 'Add property', onClick: onAddProp }}/>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STAY_PROPERTIES.map(p => <PropRow key={p.id} t={t} p={p} onClick={() => onOpenProp(p)}/>)}
        </div>
      )}
    </div>
  );
}

function PropRow({ t, p, onClick }) {
  const pct = Math.round((p.occupied / p.beds) * 100);
  return (
    <div onClick={onClick} style={{
      background: t.surface, borderRadius: 20, padding: 14,
      boxShadow: t.cardShadow, border: t.cardBorder,
      display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer',
    }}>
      <div style={{
        width: 58, height: 58, borderRadius: 14, flexShrink: 0,
        background: `linear-gradient(135deg, ${p.tone} 0%, ${p.tone}cc 100%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: staySerif, fontSize: 22,
      }}>{p.name[0]}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: staySerif, fontSize: 19, color: t.text, letterSpacing: -0.1, marginBottom: 3 }}>{p.name}</div>
        <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginBottom: 6 }}>{p.type} · {p.address}</div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ fontFamily: stayMono, fontSize: 11, color: t.text, fontWeight: 600 }}>{p.occupied}/{p.beds}</div>
          <div style={{ flex: 1, maxWidth: 100 }}><StayMeter t={t} value={p.occupied} total={p.beds} height={4}/></div>
          <div style={{ fontFamily: stayFont, fontSize: 11, color: t.textDim }}>{pct}%</div>
        </div>
      </div>
      <StayIcon name="chev" size={16} color={t.textFaint}/>
    </div>
  );
}

// ─────────────────── PROPERTY DETAIL ───────────────────
function StayPropertyDetail({ t, prop, onBack, onAddPayment }) {
  const p = prop || STAY_PROPERTIES[0];
  const pct = Math.round((p.occupied / p.beds) * 100);
  const collPct = Math.round((p.collected / p.monthly) * 100);
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onBack} style={{
          width: 40, height: 40, borderRadius: 20, background: t.chipBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.text, cursor: 'pointer',
        }}>
          <StayIcon name="back" size={18}/>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
            <StayIcon name="settings" size={17}/>
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text }}>
            <StayIcon name="users" size={17}/>
          </div>
        </div>
      </div>

      <div style={{ padding: '10px 20px 14px' }}>
        <div style={{
          height: 120, borderRadius: 20, marginBottom: 18,
          background: `linear-gradient(135deg, ${p.tone} 0%, ${p.tone}bb 100%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg, transparent 0 22px, rgba(255,255,255,0.05) 22px 23px)' }}/>
          <div style={{ position: 'absolute', top: 14, left: 16, fontFamily: stayMono, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, textTransform: 'uppercase' }}>{p.type}</div>
          <div style={{ position: 'absolute', bottom: 14, right: 16, fontFamily: staySerif, fontSize: 54, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>{pct}<span style={{ fontSize: 22 }}>%</span></div>
          <div style={{ position: 'absolute', bottom: 14, left: 16, fontFamily: stayMono, fontSize: 10, color: 'rgba(255,255,255,0.75)', letterSpacing: 1.2, textTransform: 'uppercase' }}>occupied</div>
        </div>

        <StayLabel t={t} style={{ marginBottom: 6 }}>Property</StayLabel>
        <div style={{ fontFamily: staySerif, fontSize: 34, lineHeight: 1.02, letterSpacing: -0.5, color: t.text, marginBottom: 4 }}>{p.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: stayFont, fontSize: 13, color: t.textDim }}>
          <StayIcon name="pin" size={13}/> {p.address}
        </div>
      </div>

      {/* Rent summary */}
      <div style={{ padding: '0 16px 14px' }}>
        <StayCard t={t}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <StayLabel t={t}>Rent · April</StayLabel>
              <StayNumber t={t} value={fmtINR(p.collected, { compact: true })} size={40} style={{ marginTop: 6 }}/>
              <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginTop: 4 }}>of {fmtINR(p.monthly, { compact: true })}</div>
            </div>
            <StayPill t={t} label={`${collPct}% collected`} tone={collPct >= 90 ? 'ok' : 'warn'}/>
          </div>
          <StayMeter t={t} value={p.collected} total={p.monthly}/>
        </StayCard>
      </div>

      {/* Bed grid */}
      <div style={{ padding: '10px 20px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ fontFamily: staySerif, fontSize: 22, color: t.text }}>Beds <span style={{ color: t.textFaint }}>({p.beds})</span></div>
        <div style={{ display: 'flex', gap: 10, fontFamily: stayFont, fontSize: 11.5 }}>
          <Legend t={t} color={t.accent} label="Occupied"/>
          <Legend t={t} color={t.warn} label="Notice"/>
          <Legend t={t} color={t.textFaint} label="Vacant"/>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <StayCard t={t} pad={16}>
          {[1,2,3].map(floor => (
            <div key={floor} style={{ marginBottom: floor < 3 ? 14 : 0 }}>
              <div style={{ fontFamily: stayMono, fontSize: 10, color: t.textFaint, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 }}>Floor {floor}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5 }}>
                {STAY_BEDS.slice((floor-1)*8, floor*8).map((b) => {
                  const c = b.status === 'o' ? t.accent : b.status === 'n' ? t.warn : t.chipBg;
                  const border = b.status === 'v' ? '1px dashed ' + t.borderStrong : 'none';
                  return (
                    <div key={b.id} style={{
                      height: 42, borderRadius: 8, background: c, border,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: stayMono, fontSize: 10, fontWeight: 600,
                      color: b.status === 'v' ? t.textDim : '#fff',
                      letterSpacing: 0.3,
                    }}>{b.room.slice(-1)}{b.bed}</div>
                  );
                })}
              </div>
            </div>
          ))}
        </StayCard>
      </div>

      {/* Quick actions */}
      <div style={{ padding: '16px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ActionBtn t={t} icon="wallet" label="Record payment" onClick={onAddPayment}/>
        <ActionBtn t={t} icon="users" label="Add tenant"/>
      </div>
    </div>
  );
}

function Legend({ t, color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: t.textDim }}>
      <div style={{ width: 7, height: 7, borderRadius: 2, background: color }}/> {label}
    </div>
  );
}
function ActionBtn({ t, icon, label, onClick, primary }) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      padding: '14px', borderRadius: 16,
      background: primary ? t.text : t.chipBg,
      color: primary ? t.bg : t.text,
      fontFamily: stayFont, fontSize: 13.5, fontWeight: 600,
      cursor: 'pointer',
    }}>
      <StayIcon name={icon} size={16}/> {label}
    </div>
  );
}

// ─────────────────── TENANTS ───────────────────
function StayTenants({ t, empty, onOpenTenant }) {
  const [filter, setFilter] = React.useState('all');
  const list = STAY_TENANTS.filter(x => filter === 'all' || x.status === filter);
  return (
    <div style={{ paddingBottom: 120 }}>
      <StayAppHeader t={t} title="Tenants" subtitle={empty ? '0 tenants' : `${STAY_TENANTS.length} active`}
        right={
          <div style={{ width: 40, height: 40, borderRadius: 20, background: t.text, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <StayIcon name="plus" size={18} strokeWidth={2.2}/>
          </div>
        }
      />

      <div style={{ padding: '0 20px 14px' }}>
        <StaySegmented t={t} value={filter} onChange={setFilter} options={[
          { value: 'all', label: 'All' },
          { value: 'paid', label: 'Paid' },
          { value: 'pending', label: 'Pending' },
          { value: 'overdue', label: 'Overdue' },
        ]}/>
      </div>

      {empty ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState t={t} icon="users" title="No tenants yet" body="Tenants will appear here once you add beds to a property."/>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          <StayCard t={t} pad={0}>
            {list.map((x, i) => (
              <div key={x.id} onClick={() => onOpenTenant(x)} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', cursor: 'pointer',
                borderTop: i === 0 ? 'none' : '1px solid ' + t.border,
              }}>
                <StayAvatar initials={x.initials} size={40} tone={toneForStatus(t, x.status)} t={t}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: stayFont, fontSize: 14.5, fontWeight: 600, color: t.text }}>{x.name}</div>
                  <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginTop: 2 }}>{x.bed} · {fmtINR(x.rent)}/mo</div>
                </div>
                <StayPill t={t} tone={x.status === 'paid' ? 'ok' : x.status === 'pending' ? 'warn' : 'bad'} label={x.status === 'paid' ? 'Paid' : x.status === 'pending' ? 'Due ' + x.due : 'Overdue'}/>
              </div>
            ))}
          </StayCard>
        </div>
      )}
    </div>
  );
}
function toneForStatus(t, s) {
  return s === 'paid' ? t.accent : s === 'pending' ? t.warn : t.danger;
}

// ─────────────────── TENANT DETAIL ───────────────────
function StayTenantDetail({ t, tenant, onBack, onRecord }) {
  const x = tenant || STAY_TENANTS[0];
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, cursor: 'pointer' }}>
          <StayIcon name="back" size={18}/>
        </div>
      </div>

      <div style={{ padding: '10px 20px 10px', display: 'flex', gap: 16, alignItems: 'center' }}>
        <StayAvatar initials={x.initials} size={68} tone={toneForStatus(t, x.status)} t={t}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          <StayLabel t={t} style={{ marginBottom: 4 }}>Tenant since {x.joined}</StayLabel>
          <div style={{ fontFamily: staySerif, fontSize: 28, lineHeight: 1, letterSpacing: -0.3, color: t.text }}>{x.name}</div>
          <div style={{ fontFamily: stayFont, fontSize: 13, color: t.textDim, marginTop: 6 }}>{x.bed}</div>
        </div>
      </div>

      <div style={{ padding: '14px 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <ActionBtn t={t} icon="phone" label="Call"/>
        <ActionBtn t={t} icon="mail" label="Message"/>
      </div>

      {/* Rent status */}
      <div style={{ padding: '0 16px 14px' }}>
        <StayCard t={t}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <div>
              <StayLabel t={t}>April rent</StayLabel>
              <StayNumber t={t} value={fmtINR(x.rent)} size={38} style={{ marginTop: 6 }}/>
              <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginTop: 4 }}>Due {x.due}</div>
            </div>
            <StayPill t={t} tone={x.status === 'paid' ? 'ok' : x.status === 'pending' ? 'warn' : 'bad'} label={x.status === 'paid' ? 'Paid' : x.status === 'pending' ? 'Pending' : 'Overdue'}/>
          </div>
          {x.status !== 'paid' && (
            <div onClick={onRecord} style={{
              padding: '12px 16px', borderRadius: 14, background: t.text, color: t.bg,
              fontFamily: stayFont, fontSize: 13.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              cursor: 'pointer', marginTop: 6,
            }}>
              <StayIcon name="wallet" size={15}/> Record payment
            </div>
          )}
        </StayCard>
      </div>

      {/* Contact */}
      <div style={{ padding: '0 16px 14px' }}>
        <StayLabel t={t} style={{ padding: '6px 6px 10px' }}>Contact & lease</StayLabel>
        <StayCard t={t} pad={0}>
          {[
            { icon: 'phone', label: 'Phone', value: x.phone },
            { icon: 'mail', label: 'Email', value: x.name.toLowerCase().replace(' ', '.') + '@gmail.com' },
            { icon: 'calendar', label: 'Lease start', value: x.joined },
            { icon: 'receipt', label: 'Deposit', value: fmtINR(x.rent * 2) },
          ].map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px',
              borderTop: i === 0 ? 'none' : '1px solid ' + t.border,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.textDim }}>
                <StayIcon name={r.icon} size={15}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: stayMono, fontSize: 10, color: t.textFaint, letterSpacing: 1.2, textTransform: 'uppercase' }}>{r.label}</div>
                <div style={{ fontFamily: stayFont, fontSize: 14, color: t.text, marginTop: 2 }}>{r.value}</div>
              </div>
            </div>
          ))}
        </StayCard>
      </div>
    </div>
  );
}

// ─────────────────── Empty state helper ───────────────────
function EmptyState({ t, icon, title, body, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: '30px 10px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: 32, margin: '0 auto 18px',
        background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.textDim,
      }}>
        <StayIcon name={icon} size={26}/>
      </div>
      <div style={{ fontFamily: staySerif, fontSize: 24, color: t.text, marginBottom: 8, letterSpacing: -0.2 }}>{title}</div>
      <div style={{ fontFamily: stayFont, fontSize: 13.5, color: t.textDim, lineHeight: 1.55, maxWidth: 280, margin: '0 auto 18px' }}>{body}</div>
      {cta && (
        <div onClick={cta.onClick} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 20px', borderRadius: 100,
          background: t.text, color: t.bg,
          fontFamily: stayFont, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
        }}>
          <StayIcon name="plus" size={15} strokeWidth={2.2}/> {cta.label}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { StayDashboard, StayProperties, StayPropertyDetail, StayTenants, StayTenantDetail, EmptyState, ActionBtn });
