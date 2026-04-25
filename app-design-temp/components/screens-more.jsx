// Screens 6–10: Payments, Add Property flow, Record Payment, Notifications, Profile

// ─────────────────── PAYMENTS ───────────────────
function StayPayments({ t, empty, onRecord }) {
  const [tab, setTab] = React.useState('all');
  const T = STAY_TOTALS;
  return (
    <div style={{ paddingBottom: 120 }}>
      <StayAppHeader t={t} title="Payments" subtitle={T.month}
        right={
          <div onClick={onRecord} style={{ width: 40, height: 40, borderRadius: 20, background: t.text, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <StayIcon name="plus" size={18} strokeWidth={2.2}/>
          </div>
        }/>

      {/* Big summary */}
      <div style={{ padding: '0 16px 14px' }}>
        <StayCard t={t} pad={22} style={{ background: t.dark ? '#1A1A17' : '#111110', color: '#fff' }}>
          <div style={{ fontFamily: stayMono, fontSize: 10.5, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>Collected this month</div>
          <div style={{
            fontFamily: staySerif, fontSize: 66, lineHeight: 1, letterSpacing: -1,
            marginTop: 10, marginBottom: 14, color: '#fff',
          }}>
            {empty ? '₹0' : fmtINR(T.revenueCollected, { compact: true })}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.15)' }}>
            <div style={{ width: empty ? 0 : `${(T.revenueCollected/T.revenueTarget)*100}%`, height: 6, borderRadius: 3, background: '#fff' }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontFamily: stayFont, fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>
            <div>Target {fmtINR(empty ? 0 : T.revenueTarget, { compact: true })}</div>
            <div>{empty ? '0%' : Math.round((T.revenueCollected/T.revenueTarget)*100) + '%'}</div>
          </div>
        </StayCard>
      </div>

      <div style={{ padding: '0 20px 14px' }}>
        <StaySegmented t={t} value={tab} onChange={setTab} options={[
          { value: 'all', label: 'All' },
          { value: 'received', label: 'Received' },
          { value: 'pending', label: 'Pending' },
        ]}/>
      </div>

      {empty ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState t={t} icon="wallet" title="No payments yet" body="Once tenants start paying, their receipts will land here." cta={{ label: 'Record payment', onClick: onRecord }}/>
        </div>
      ) : (
        <div style={{ padding: '0 16px' }}>
          <StayLabel t={t} style={{ padding: '4px 6px 8px' }}>Today · Apr 20</StayLabel>
          <StayCard t={t} pad={0} style={{ marginBottom: 14 }}>
            {STAY_PAYMENTS.slice(0,2).map((p, i) => <PaymentRow key={p.id} t={t} p={p} first={i===0}/>)}
          </StayCard>
          <StayLabel t={t} style={{ padding: '4px 6px 8px' }}>Yesterday</StayLabel>
          <StayCard t={t} pad={0} style={{ marginBottom: 14 }}>
            {STAY_PAYMENTS.slice(2,4).map((p, i) => <PaymentRow key={p.id} t={t} p={p} first={i===0}/>)}
          </StayCard>
          <StayLabel t={t} style={{ padding: '4px 6px 8px' }}>Earlier</StayLabel>
          <StayCard t={t} pad={0}>
            {STAY_PAYMENTS.slice(4).map((p, i) => <PaymentRow key={p.id} t={t} p={p} first={i===0}/>)}
          </StayCard>
        </div>
      )}
    </div>
  );
}
function PaymentRow({ t, p, first }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderTop: first ? 'none' : '1px solid ' + t.border,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: t.accentSoft, color: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StayIcon name="arrowDown" size={16} strokeWidth={2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: stayFont, fontSize: 14, fontWeight: 600, color: t.text }}>{p.who}</div>
        <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim, marginTop: 2 }}>{p.ref} · {p.method}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: staySerif, fontSize: 19, color: t.text, letterSpacing: -0.2 }}>{fmtINR(p.amount)}</div>
        <div style={{ fontFamily: stayFont, fontSize: 10.5, color: t.textFaint, marginTop: 1 }}>{p.when.split(',')[1] || p.when}</div>
      </div>
    </div>
  );
}

// ─────────────────── ADD PROPERTY (mini flow screen) ───────────────────
function StayAddProperty({ t, onBack, onDone }) {
  const [step, setStep] = React.useState(1);
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, cursor: 'pointer' }}>
          <StayIcon name="close" size={18}/>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1,2,3].map(s => (
            <div key={s} style={{
              width: 20, height: 4, borderRadius: 2,
              background: s <= step ? t.text : t.chipBg,
            }}/>
          ))}
        </div>
        <div style={{ width: 40 }}/>
      </div>

      <div style={{ padding: '20px 20px 10px' }}>
        <StayLabel t={t} style={{ marginBottom: 10 }}>Step {step} of 3</StayLabel>
        <div style={{ fontFamily: staySerif, fontSize: 32, lineHeight: 1.04, letterSpacing: -0.4, color: t.text }}>
          {step === 1 && <>What's your<br/><span style={{ fontStyle: 'italic', color: t.accent }}>property</span> called?</>}
          {step === 2 && <>How many <span style={{ fontStyle: 'italic', color: t.accent }}>beds</span>?</>}
          {step === 3 && <>Set <span style={{ fontStyle: 'italic', color: t.accent }}>rent</span> per bed</>}
        </div>
      </div>

      <div style={{ padding: '22px 16px 16px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field t={t} label="Property name" value="Bluegrass PG" placeholder="e.g. Ivy House"/>
            <Field t={t} label="Type" value="Boys · Coliving" right={<StayIcon name="chevDown" size={14} color={t.textDim}/>}/>
            <Field t={t} label="Address" value="HSR Layout, Bengaluru" right={<StayIcon name="pin" size={14} color={t.textDim}/>} multi/>
          </div>
        )}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
              <Field t={t} label="Total floors" value="3"/>
              <Field t={t} label="Beds per floor" value="8"/>
            </div>
            <StayCard t={t}>
              <StayLabel t={t} style={{ marginBottom: 10 }}>Preview · 24 beds</StayLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4 }}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 6, background: t.chipBg, border: '1px dashed ' + t.borderStrong }}/>
                ))}
              </div>
            </StayCard>
          </div>
        )}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field t={t} label="Rent (per bed)" value="10,500" prefix="₹" />
            <Field t={t} label="Security deposit" value="21,000" prefix="₹" />
            <Field t={t} label="Rent due date" value="5th of each month" right={<StayIcon name="calendar" size={14} color={t.textDim}/>}/>
            <StayCard t={t} pad={16} style={{ background: t.accentSoft, border: 'none' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <StayIcon name="trendUp" size={18} color={t.accent}/>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: stayFont, fontSize: 13, fontWeight: 600, color: t.accent, marginBottom: 2 }}>Projected monthly revenue</div>
                  <div style={{ fontFamily: staySerif, fontSize: 28, color: t.accent, letterSpacing: -0.3 }}>₹2.52L</div>
                </div>
              </div>
            </StayCard>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div style={{ padding: '16px 16px 20px', position: 'sticky', bottom: 70 }}>
        <div onClick={() => { if (step < 3) setStep(step + 1); else onDone(); }} style={{
          padding: '15px', borderRadius: 16, background: t.text, color: t.bg,
          fontFamily: stayFont, fontSize: 14.5, fontWeight: 600, textAlign: 'center',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer',
        }}>
          {step < 3 ? 'Continue' : 'Create property'} <StayIcon name="arrowRight" size={16} strokeWidth={2}/>
        </div>
      </div>
    </div>
  );
}

function Field({ t, label, value, placeholder, prefix, right, multi }) {
  return (
    <div style={{
      background: t.surface, borderRadius: 16, padding: '12px 16px',
      boxShadow: t.cardShadow, border: t.cardBorder,
    }}>
      <div style={{ fontFamily: stayMono, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textFaint, marginBottom: 6 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {prefix && <span style={{ fontFamily: staySerif, fontSize: 22, color: t.textDim }}>{prefix}</span>}
        <div style={{
          flex: 1, fontFamily: prefix ? staySerif : stayFont,
          fontSize: prefix ? 22 : (multi ? 14 : 16), fontWeight: prefix ? 400 : 500,
          color: value ? t.text : t.textFaint,
          letterSpacing: prefix ? -0.2 : 0,
          lineHeight: multi ? 1.4 : 1.2,
        }}>{value || placeholder}</div>
        {right}
      </div>
    </div>
  );
}

// ─────────────────── RECORD PAYMENT (bottom sheet) ───────────────────
function StayRecordPayment({ t, onClose, onDone }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      {/* scrim */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}/>
      <div style={{
        position: 'relative',
        background: t.bg,
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: '10px 20px 28px',
        maxHeight: '88%', overflow: 'auto',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: t.borderStrong, margin: '6px auto 20px' }}/>

        <StayLabel t={t} style={{ marginBottom: 6 }}>Record payment</StayLabel>
        <div style={{ fontFamily: staySerif, fontSize: 28, lineHeight: 1.05, letterSpacing: -0.3, color: t.text, marginBottom: 20 }}>
          New rent receipt
        </div>

        {/* Tenant picker */}
        <div style={{ background: t.surface, borderRadius: 16, padding: 14, boxShadow: t.cardShadow, border: t.cardBorder, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <StayAvatar initials="RK" size={40} tone={t.warn} t={t}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: stayMono, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textFaint }}>Tenant</div>
            <div style={{ fontFamily: stayFont, fontSize: 15, fontWeight: 600, color: t.text }}>Rohan Kapoor</div>
            <div style={{ fontFamily: stayFont, fontSize: 12, color: t.textDim }}>Blue · 104A</div>
          </div>
          <StayIcon name="chev" size={14} color={t.textDim}/>
        </div>

        {/* Amount — expressive */}
        <div style={{
          background: t.surface, borderRadius: 20, padding: '22px 18px',
          boxShadow: t.cardShadow, border: t.cardBorder, marginBottom: 12, textAlign: 'center',
        }}>
          <StayLabel t={t} style={{ marginBottom: 14 }}>Amount</StayLabel>
          <div style={{ fontFamily: staySerif, fontSize: 64, lineHeight: 1, letterSpacing: -1.2, color: t.text }}>
            <span style={{ color: t.textDim, fontSize: 40 }}>₹</span>10,500
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16 }}>
            {['Full month', '+ late fee', 'Partial'].map((q, i) => (
              <div key={q} style={{
                padding: '6px 12px', borderRadius: 100,
                background: i === 0 ? t.text : t.chipBg,
                color: i === 0 ? t.bg : t.textDim,
                fontFamily: stayFont, fontSize: 12, fontWeight: 600,
              }}>{q}</div>
            ))}
          </div>
        </div>

        {/* Method */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
          {[
            { k: 'UPI', a: true },
            { k: 'Cash' },
            { k: 'Card' },
            { k: 'Bank' },
          ].map(m => (
            <div key={m.k} style={{
              padding: '14px 6px', borderRadius: 14, textAlign: 'center',
              background: m.a ? t.text : t.chipBg,
              color: m.a ? t.bg : t.text,
              fontFamily: stayFont, fontSize: 13, fontWeight: 600,
            }}>{m.k}</div>
          ))}
        </div>

        <Field t={t} label="Note (optional)" value="" placeholder="e.g. Paid via PhonePe" multi/>

        <div onClick={onDone} style={{
          marginTop: 18, padding: '16px', borderRadius: 16,
          background: t.accent, color: '#fff',
          fontFamily: stayFont, fontSize: 14.5, fontWeight: 600,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          cursor: 'pointer',
        }}>
          <StayIcon name="check" size={17} strokeWidth={2.2}/> Record ₹10,500
        </div>
      </div>
    </div>
  );
}

// ─────────────────── NOTIFICATIONS ───────────────────
function StayNotifications({ t, empty, onBack }) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, cursor: 'pointer' }}>
          <StayIcon name="back" size={18}/>
        </div>
        {!empty && <div style={{ fontFamily: stayFont, fontSize: 13, color: t.accent, fontWeight: 600 }}>Mark all read</div>}
      </div>
      <StayAppHeader t={t} title="Notifications" subtitle={empty ? 'All caught up' : '3 new'}/>

      {empty ? (
        <div style={{ padding: '40px 20px' }}>
          <EmptyState t={t} icon="bell" title="All quiet" body="When tenants pay, beds change, or rent is due — you'll see it here."/>
        </div>
      ) : (
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <StayLabel t={t} style={{ padding: '6px 6px 4px' }}>Today</StayLabel>
          {STAY_NOTIFS.filter(n => n.unread).map(n => <NotifRow key={n.id} t={t} n={n}/>)}
          <StayLabel t={t} style={{ padding: '14px 6px 4px' }}>Earlier</StayLabel>
          {STAY_NOTIFS.filter(n => !n.unread).map(n => <NotifRow key={n.id} t={t} n={n}/>)}
        </div>
      )}
    </div>
  );
}
function NotifRow({ t, n }) {
  const kind = {
    payment: { icon: 'arrowDown', color: t.accent, soft: t.accentSoft },
    rent:    { icon: 'calendar', color: t.warn, soft: t.warnSoft },
    overdue: { icon: 'bell', color: t.danger, soft: t.dark ? 'rgba(214,138,122,0.18)' : 'rgba(163,68,46,0.10)' },
    lease:   { icon: 'receipt', color: t.textDim, soft: t.chipBg },
    bed:     { icon: 'bed', color: t.textDim, soft: t.chipBg },
  }[n.kind];
  return (
    <div style={{
      background: t.surface, borderRadius: 16, padding: 14,
      boxShadow: t.cardShadow, border: t.cardBorder,
      display: 'flex', gap: 12, alignItems: 'flex-start',
      position: 'relative',
    }}>
      {n.unread && <div style={{ position: 'absolute', top: 16, right: 14, width: 7, height: 7, borderRadius: 4, background: t.accent }}/>}
      <div style={{ width: 36, height: 36, borderRadius: 10, background: kind.soft, color: kind.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <StayIcon name={kind.icon} size={15} strokeWidth={2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
        <div style={{ fontFamily: stayFont, fontSize: 14, fontWeight: 600, color: t.text }}>{n.title}</div>
        <div style={{ fontFamily: stayFont, fontSize: 12.5, color: t.textDim, marginTop: 3, lineHeight: 1.45 }}>{n.body}</div>
        <div style={{ fontFamily: stayMono, fontSize: 10, color: t.textFaint, letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>{n.when}</div>
      </div>
    </div>
  );
}

// ─────────────────── PROFILE / SETTINGS ───────────────────
function StayProfile({ t, onBack }) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <div style={{ padding: '8px 16px 8px', display: 'flex', alignItems: 'center' }}>
        <div onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, background: t.chipBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.text, cursor: 'pointer' }}>
          <StayIcon name="back" size={18}/>
        </div>
      </div>

      <div style={{ padding: '20px 20px 24px', textAlign: 'center' }}>
        <div style={{
          width: 84, height: 84, borderRadius: 42, margin: '0 auto 14px',
          background: t.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: staySerif, fontSize: 34,
        }}>HK</div>
        <div style={{ fontFamily: staySerif, fontSize: 28, color: t.text, letterSpacing: -0.3, marginBottom: 4 }}>Himanshu Kumar</div>
        <div style={{ fontFamily: stayFont, fontSize: 13, color: t.textDim }}>himanshu@pascalcase.com</div>
        <div style={{ display: 'inline-flex', marginTop: 12, padding: '4px 12px', borderRadius: 100, background: t.accentSoft, color: t.accent, fontFamily: stayFont, fontSize: 11.5, fontWeight: 600 }}>
          Owner · Free plan
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ padding: '0 16px 14px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {[
          { n: '4', l: 'Properties' },
          { n: '60', l: 'Tenants' },
          { n: '₹6.3L', l: 'Collected' },
        ].map(s => (
          <div key={s.l} style={{
            background: t.surface, borderRadius: 16, padding: 14, textAlign: 'center',
            boxShadow: t.cardShadow, border: t.cardBorder,
          }}>
            <div style={{ fontFamily: staySerif, fontSize: 26, color: t.text, letterSpacing: -0.3 }}>{s.n}</div>
            <div style={{ fontFamily: stayMono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: t.textDim, marginTop: 4 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Settings groups */}
      {[
        { title: 'Account', rows: [
          { i: 'users', l: 'Personal details' },
          { i: 'building', l: 'Business profile' },
          { i: 'receipt', l: 'Tax & GST' },
        ]},
        { title: 'Preferences', rows: [
          { i: 'bell', l: 'Notifications' },
          { i: 'settings', l: 'Payment reminders' },
          { i: 'wallet', l: 'Accepted methods' },
        ]},
        { title: 'Support', rows: [
          { i: 'mail', l: 'Contact support' },
          { i: 'receipt', l: 'Export data' },
          { i: 'close', l: 'Sign out', danger: true },
        ]},
      ].map(g => (
        <div key={g.title}>
          <StayLabel t={t} style={{ padding: '14px 22px 10px' }}>{g.title}</StayLabel>
          <div style={{ padding: '0 16px 4px' }}>
            <StayCard t={t} pad={0}>
              {g.rows.map((r, i) => (
                <div key={r.l} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px',
                  borderTop: i === 0 ? 'none' : '1px solid ' + t.border,
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: t.chipBg, color: r.danger ? t.danger : t.textDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StayIcon name={r.i} size={15}/>
                  </div>
                  <div style={{ flex: 1, fontFamily: stayFont, fontSize: 14, color: r.danger ? t.danger : t.text }}>{r.l}</div>
                  <StayIcon name="chev" size={14} color={t.textFaint}/>
                </div>
              ))}
            </StayCard>
          </div>
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { StayPayments, StayAddProperty, StayRecordPayment, StayNotifications, StayProfile, Field });
