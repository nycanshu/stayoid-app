# Stayoid Mobile — App Plan

> Complete reference for building the React Native app.
> Covers UX philosophy, mobile-first screen design, state management, animations, and design tokens.
> Extracted from live web v2 + redesigned for how a PG owner actually uses their phone.

---

## 0. Who Is This App For? (Start Here)

Before writing a single line of code, understand the user.

**Primary user:** A PG owner in India. Typically manages 1–5 properties with 10–100 rooms. Not a tech-heavy person. Opens the app multiple times a day. Always on their phone, rarely at a computer.

**What they do every day:**
1. Check: "Did everyone pay this month?"
2. Record a cash payment someone just handed them
3. Check: "Which rooms are vacant?"
4. Call a tenant who's overdue
5. Add a new tenant to a vacant room

**What they do occasionally:**
- Add a new property / floor / room
- View payment history for a tenant
- Export or review records

**The design principle that follows from this:**
> The app must answer the 5 daily questions in under 2 taps each.
> Everything else is secondary.

---

## 1. Navigation — Rethought for Mobile

The web has a sidebar because there's screen real estate. Mobile gets a bottom tab bar — but the *tabs themselves* must reflect daily usage, not just mirror the web's menu items.

### Tab bar (4 tabs)

```
┌──────┬───────────┬─────────┬──────────┐
│  🏠  │    🏢     │   💳    │   ☰    │
│ Home │ Properties│Payments │   More   │
└──────┴───────────┴─────────┴──────────┘
```

| Tab | Why |
|---|---|
| **Home** | Today's snapshot + quick actions. Most opened screen. |
| **Properties** | Owners check room occupancy constantly. |
| **Payments** | Recording and checking payments is the #1 daily task. |
| **More** | Tenants, Settings, anything not daily. |

> **Why no Tenants tab?** Tenants are usually accessed *through* a payment or a property. Putting it in "More" reduces clutter without hiding it — it's one extra tap away which is fine since it's not daily.

### Tab bar design
```
Background: bg-card (dark: #181818, light: #FFFFFF)
Border top: border-border (dark: #272727, light: #E5E7EB)
Active icon: text-primary (#4F9D7E) + label
Inactive icon: text-muted-foreground (#A3A3A3)
Active indicator: thin underline or filled dot above icon, color: primary
Height: 60px (safe area inset below)
```

### Global FAB (Floating Action Button)
A `+` FAB sits on every screen except auth. Tapping it opens a bottom action sheet:

```
┌────────────────────────┐
│  What do you want to do? │
│                        │
│  [💳 Record Payment]  ← primary, always first
│  [👤 Add Tenant]
│  [🏢 Add Property]
│                        │
│       [Cancel]         │
└────────────────────────┘
```

This means the user never has to navigate to a specific screen to do the most common actions. The FAB is the mobile equivalent of the web's header "Add" buttons.

---

## 2. Onboarding Flow (Replaces Landing Page)

The web has a public marketing site. Mobile has none of that — instead it has a focused onboarding experience.

### App launch sequence
```
[Splash screen: 1.5s]
  Stayoid logo centered on dark bg
  Tagline: "Property management, simplified."
  Animate: logo scales in (spring), tagline fades in (delay 300ms)

↓ (auto-advance)

[Welcome screens: 3 swipeable cards]
  Slide 1: "Know who's paid at a glance"
           Illustration: payment status list
  Slide 2: "Manage all your properties in one place"
           Illustration: property + floor + room hierarchy
  Slide 3: "Get started free. No setup fee."
           [Log In]  [Create Account]

↓ (user action)

[Login / Signup screen]

↓ (after first login, if no properties exist)

[Onboarding property setup: 4-step bottom sheet]
  Step 1: Property type → PG / Flat / Hostel
  Step 2: Property name + address
  Step 3: How many floors?
  Step 4: Rooms per floor (generates units automatically)
  [Done → goes to Home with property populated]
```

### Onboarding bottom sheet
- Slides up over a dimmed background (not full-screen navigation)
- Step indicator: dots at top (●●○○)
- Each step: clean single question, large touch targets
- "Skip for now" link at bottom — dismisses, reminds next session
- Completion triggers `queryClient.invalidateQueries(['properties'])`

---

## 3. Home Screen — The "Today" Dashboard

The web dashboard is a portfolio overview with charts and tables. On mobile, the same data should tell a story at a glance: **"Here's where things stand right now."**

### Layout (top to bottom)

```
─────────────────────────────────────────
  Good morning, Himanshu             [👤]
  Saturday, 25 April 2026
─────────────────────────────────────────

  ┌──────────────────────────────────────┐
  │  April Collection                    │
  │  ₹48,000  ────────────────── 85%    │
  │  of ₹56,500                         │
  │  [████████████████░░░] 4 paid · 1 ⚠ │
  └──────────────────────────────────────┘

  ┌─────────────┐  ┌─────────────┐
  │ Occupancy   │  │ Properties  │
  │    50%      │  │     3       │
  │ 5 of 10     │  │ 10 rooms    │
  └─────────────┘  └─────────────┘

  ─── Needs Attention ──────────────────
  ┌──────────────────────────────────────┐
  │ ⚠  Priya Iyer hasn't paid April rent│
  │    Sunrise PG · Room 201   [Call]   │
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │ 🏢  Green Valley Residency           │
  │    0 of 0 rooms filled — add tenants│
  └──────────────────────────────────────┘

  ─── Your Properties ──────────────────
  [Himalaya Heights]  2/3  [Sunrise PG]  3/7  →

  ─── Quick Actions ────────────────────
  [💳 Record]  [👤 Add Tenant]  [📊 Reports]
─────────────────────────────────────────
```

### Home screen anatomy

**Header bar:**
- Left: Greeting + date (system font, 16sp bold + 13sp muted)
- Right: Avatar circle (initials) → taps to Profile/Settings
- No back button, no breadcrumbs — this is the root

**Collection card (most prominent):**
- Full-width `bg-card border rounded-2xl p-5`
- Title: "April Collection" (month is always current)
- Amount: `₹48,000` in 28sp semibold, suffix "of ₹56,500" in 14sp muted
- Progress bar: thick (h=8px), `bg-primary` fill, `bg-muted` track, rounded
- Below bar: "4 paid · 1 pending" — the pending count is a tappable chip → goes to Payments filtered by unpaid

**2×2 stat grid:**
- `Occupancy %` and `Properties` only — not all 4 web stats
- Mobile: show the 2 most actionable numbers; hide what users don't check daily
- Cards: `bg-card border rounded-xl p-4`, value 22sp semibold, label 12sp muted

**Needs Attention section (the real value-add):**
- Only appears if there are issues (unpaid tenants, empty properties, overdue)
- Alert rows: amber left-border, icon + tenant name + property/room + [Call] button
- [Call] triggers `Linking.openURL('tel:...')` — one tap to call the overdue tenant
- If nothing needs attention: "All clear for April 🎉" — positive empty state

**Properties horizontal scroll:**
- Not a full grid — quick peek chips showing property name + occupancy fraction
- Tapping → navigates to Properties tab
- More visual, less data: just "3/7" rooms shown with a tiny ring progress

**Quick Actions row:**
- 3 pill buttons: Record Payment, Add Tenant, Reports
- These are shortcuts; they duplicate the FAB for discoverability

---

## 4. Properties Screen

### List view

```
─────────────────────────────────────────
  Properties                     [+ Add]
  3 properties · 10 rooms total
─────────────────────────────────────────

  [🔍 Search by name or address      ]

  ┌──────────────────────────────────────┐
  │ Himalaya Heights             [Flat] │
  │ 22 Indiranagar, Bangalore           │
  │                                      │
  │  ████████████████████░░  2/3 rooms  │
  │  ₹32,000 collected this month       │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │ Sunrise PG                   [PG]   │
  │ 123 MG Road, Bangalore              │
  │                                      │
  │  ████████░░░░░░░░░░░░░░  3/7 rooms  │
  │  ₹16,000 of ₹24,500                 │
  └──────────────────────────────────────┘

  ┌──────────────────────────────────────┐
  │ + Add another property              │
  │   Create another PG or flat         │
  └──────────────────────────────────────┘
─────────────────────────────────────────
```

**PropertyCard refinements for mobile:**
- Remove the edit/delete icons from the card face — put them behind a long-press or a `⋯` icon in the top-right corner to reduce clutter
- Progress bar is thicker on mobile (h=8) vs web (h=2) — easier to read at a glance
- Collected amount shown as fraction only if partially collected; show "All collected ✓" in green if 100%
- Address is one line, truncated with ellipsis — full address visible on property detail

### Property Detail

The web uses a tabs pattern (Floors / Tenants / Payments). Mobile keeps tabs but redesigns the **Floors tab** to be visual instead of a plain list.

```
─────────────────────────────────────────
  ←  Sunrise PG               [Edit] [⋯]
     PG · 123 MG Road
─────────────────────────────────────────

  ┌───────────┬───────────┬─────────────┐
  │  Occ 43%  │  2 floors │  3 tenants  │
  └───────────┴───────────┴─────────────┘

  [Floors]   [Tenants]   [Payments]
  ─────────────────────────────────────

  Floors tab:

  GROUND FLOOR
  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
  │ 101  │ │ 102  │ │ 103  │ │ 104  │
  │ Arjun│ │Vacant│ │Vacant│ │Rahul │
  └──────┘ └──────┘ └──────┘ └──────┘
   ● green   ○ gray   ○ gray   ● green

  FIRST FLOOR
  ┌──────┐ ┌──────┐ ┌──────┐
  │ 201  │ │ 202  │ │ 203  │
  │Anjali│ │Vacant│ │Vacant│
  └──────┘ └──────┘ └──────┘
   ● green   ○ gray   ○ gray

  [+ Add Floor]
─────────────────────────────────────────
```

**Room grid design:**
- Each room is a square card (`w=80, h=80` on 390px screen = 4 per row)
- Occupied: `bg-primary/15 border-primary/40 rounded-xl` + tenant's first name in 11sp
- Vacant: `bg-muted border-border rounded-xl` + "Vacant" in 11sp muted
- Overdue: `bg-destructive/10 border-destructive/30` + red dot indicator
- Tap occupied room → tenant detail (bottom sheet or push)
- Tap vacant room → "Assign tenant" bottom sheet

This visual grid is far more useful on mobile than a collapsible list — owners recognize their rooms spatially.

---

## 5. Payments Screen

Payments is the highest-frequency daily screen. The design must make it effortless to record a payment and see who still owes.

### Layout

```
─────────────────────────────────────────
  Payments                 [Record +]
─────────────────────────────────────────

  April 2026  ←  →    [This month]
  ┌──────────────────────────────────────┐
  │  ████████████████████████  100%     │
  │  ₹48,000 collected · 4 paid         │
  │  0 pending                          │
  └──────────────────────────────────────┘

  [All]  [Unpaid]  [This month]     ▼ Filter

  ─── PAID ────────────────────────────
  ┌──────────────────────────────────────┐
  │ [AK] Anjali Kapoor          ₹18,000 │
  │      Himalaya · Room 101   Apr 2026 │
  │      UPI · Paid ✓                   │
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │ [KM] Karan Mehta            ₹14,000 │
  │      Sunrise PG · Room 201  Apr 2026│
  │      Cash · Paid ✓                  │
  └──────────────────────────────────────┘
─────────────────────────────────────────
```

**Key mobile improvements over web:**

- **Month navigator** (← April 2026 →): swiping left/right changes the month — no dropdowns needed
- **Grouped sections**: "UNPAID" section always shown first with alert styling, "PAID" below — owners care about who hasn't paid, not the alphabetical list
- **Swipe-to-action**: swipe a row right → "Mark Paid" quick action (opens method picker: UPI / Cash / Bank)
- **Payment row** shows avatar initials circle (no photo needed) + name + property/room + method badge + amount
- **Record Payment button** in header — always visible, never hidden

**Record Payment bottom sheet:**
```
  ┌────────────────────────────────────────┐
  │  Record Payment              [✕]       │
  │                                        │
  │  Tenant  [Search or select tenant  ▼] │
  │  Amount  [₹ ____________]             │
  │  Month   [April 2026              ▼]  │
  │  Method  [UPI] [Cash] [Bank] [Other]  │
  │  Note    [Optional note...]           │
  │                                        │
  │        [Save Payment]                  │
  └────────────────────────────────────────┘
```
- Bottom sheet (not full screen) — user can see context behind
- Method is a segmented selector (pill buttons), not a dropdown
- Amount field: numeric keyboard pre-loaded, ₹ prefix shown
- After save: success toast + sheet closes + list refreshes

---

## 6. Tenants Screen (in "More" tab)

```
─────────────────────────────────────────
  Tenants                      [+ Add]
─────────────────────────────────────────

  [🔍 Search tenants              ]
  [All Properties ▼]   [Active ▼]

  ┌──────────────────────────────────────┐
  │ [AK] Anjali Kapoor          ● Active │
  │      Himalaya · Room 101             │
  │      Joined 12 Jan 2026              │
  └──────────────────────────────────────┘
  ┌──────────────────────────────────────┐
  │ [RS] Rahul Sharma           ● Active │
  │      Sunrise PG · Room 203           │
  │      ⚠ Unpaid April                 │
  └──────────────────────────────────────┘
```

**Mobile refinements:**
- Contact-style card list (not a table — tables are unusable on 390px wide)
- Avatar circle with initials — two-letter, colored by name hash
- Status chip inline (Active = green, Exited = muted)
- Unpaid indicator — amber "⚠ Unpaid April" shows inline — visible without tapping
- Tap row → Tenant detail screen

### Tenant Detail
```
─────────────────────────────────────────
  ←  Anjali Kapoor
─────────────────────────────────────────

  ┌──────────────────────────────────────┐
  │  [AK] Anjali Kapoor    ● Active      │
  │  📞 +91 98765 43210   [Call]         │
  │  📍 Himalaya Heights · Room 101      │
  │  📅 Joined 12 Jan 2026               │
  │  💰 Deposit: ₹20,000                 │
  └──────────────────────────────────────┘

  ─── Payment History ─────────────────
  [April 2026] ₹18,000 · UPI · ✓ Paid
  [March 2026] ₹18,000 · Cash · ✓ Paid
  [February 2026] ₹18,000 · UPI · ✓ Paid

  [Record Payment for this tenant]
─────────────────────────────────────────
```

**Key mobile features:**
- [Call] button next to phone — `Linking.openURL('tel:...')` — one tap
- Payment history timeline (not a table) — month + amount + method + status
- "Record Payment" button pinned at bottom — contextual, no navigation needed

---

## 7. More Tab

```
─────────────────────────────────────────
  More
─────────────────────────────────────────

  ┌──────────────────────────────────────┐
  │ [HK] Himanshu Kumar                  │
  │      himanshu@pascalcase.com         │
  └──────────────────────────────────────┘

  ─── Management ──────────────────────
  👥 Tenants                           →
  📊 Reports (coming soon)             →

  ─── Account ─────────────────────────
  🎨 Appearance                        →
  📱 Notifications                     →
  🔒 Account & Security                →

  ─── App ─────────────────────────────
  ⭐ Rate Stayoid
  💬 Send Feedback
  🚪 Log Out
─────────────────────────────────────────
```

- Profile row at top — tappable → Profile edit
- Grouped sections with headers
- Each row: icon + label + chevron (→)
- Log Out is red text, no chevron, confirmation alert before action

---

## 8. Auth Screens

### Login
```
─────────────────────────────────────────
  [← Back]

       [Stayoid logo]
       Welcome back

  Email
  [________________________]

  Password
  [________________________] [👁]

  [Forgot Password?]

  [         Log In         ]

  ─────── or ──────────────
  Don't have an account? Sign up
─────────────────────────────────────────
```

### Signup
```
─────────────────────────────────────────
       [Stayoid logo]
       Create your account

  Full Name
  [________________________]

  Email
  [________________________]

  Password
  [________________________] [👁]

  ● 8+ characters
  ● One letter
  ● One number

  [       Create Account    ]

  Already have an account? Log in
─────────────────────────────────────────
```

**Password requirement pills:**
- Same as web: 3 pills that turn green as conditions are met
- Live validation on each keystroke (`watch('password')`)
- Pills shown only when password field has content

---

## 9. Design Tokens — Exact Web v2 Values

### Colors

```ts
// lib/theme/tokens.ts
export const colors = {
  background: { light: '#F8F9FB', dark: '#0F0F0F' },
  card:       { light: '#FFFFFF', dark: '#181818' },
  border:     { light: '#E5E7EB', dark: '#272727' },
  muted:      { light: '#F5F5F5', dark: '#272727' },
  mutedFg:    { light: '#737373', dark: '#A3A3A3' },
  foreground: { light: '#1E1E1E', dark: '#FAFAFA' },

  primary:    '#4F9D7E',   // Stayoid green
  primaryFg:  '#FFFFFF',
  secondary:  '#E8D4B8',   // warm beige
  accent:     '#9B9FCE',   // soft purple

  success:     '#22C55E',
  successBg:  { light: '#DCFCE7', dark: '#1E3C28' },
  warning:     '#F59E0B',
  warningBg:  { light: '#FEF3C7', dark: '#3C2D0F' },
  destructive: '#EF4444',
  info:        '#3B82F6',
  infoBg:     { light: '#DBEAFE', dark: '#192841' },
};
```

### Typography

Web uses **Inter** (body) + **Playfair Display** (brand headings). Match this exactly.

```ts
// Install: npx expo install @expo-google-fonts/inter @expo-google-fonts/playfair-display
fonts: {
  'Inter_400Regular',
  'Inter_500Medium',
  'Inter_600SemiBold',
  'PlayfairDisplay_600SemiBold',
}
```

| Use | Size | Weight | Family |
|---|---|---|---|
| Screen h1 | 22sp | 600 | Inter |
| Section heading | 18sp | 600 | Playfair Display |
| Card title / property name | 16sp | 600 | Playfair Display |
| Body text | 14–15sp | 400 | Inter |
| Labels / meta | 12–13sp | 500 | Inter |
| Badges / tiny | 10–11sp | 500 | Inter |
| Currency amounts | varies | 600 | Inter, `tabular-nums` |

### Spacing & Radius

```ts
spacing: {
  xs: 4, sm: 8, md: 12, base: 16, lg: 20, xl: 24, '2xl': 32
}

radius: {
  sm: 8,   // inputs, small buttons
  md: 10,  // filter pills, small cards
  lg: 12,  // property cards, stat cards  (web: rounded-xl)
  xl: 16,  // large cards, bottom sheets  (web: rounded-2xl)
  full: 999 // badges, avatars, pills
}
```

### StatusBadge color map

| Status | Background | Text |
|---|---|---|
| Active | `success-bg` | `success` |
| Exited | `muted` | `muted-fg` |
| Paid | `success-bg` | `success` |
| Partial | `warning-bg` | `warning` |
| Pending | `destructive/10` | `destructive` |

---

## 10. Animation System — Reanimated 3

All web animations use Framer Motion. The React Native equivalent is **React Native Reanimated 3**.

### Timing curves (exact web values)

```ts
// lib/theme/motion.ts
import { Easing } from 'react-native-reanimated';

export const ease = {
  // Used for all dashboard page/content transitions
  standard: { duration: 400, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) },
  // Used for landing/onboarding fade-ins
  smooth:   { duration: 600, easing: Easing.bezier(0.25, 0.10, 0.25, 1.00) },
  // Used for fade-ins on scroll
  enter:    { duration: 550, easing: Easing.bezier(0.25, 0.10, 0.25, 1.00) },
};
```

### Screen entry (PageTransition)
Every screen root: `opacity 0→1, translateY 20→0, 400ms`
```ts
entering={FadeInUp.duration(400).easing(Easing.bezier(0.25, 0.46, 0.45, 0.94))}
```

### List stagger (StaggerGrid)
Items enter one-by-one at 80ms intervals:
```ts
// Wrap each FlatList item:
entering={FadeInUp.delay(index * 80).duration(400)}
```

### Card press (HoverCardWrapper equivalent)
```ts
const scale = useSharedValue(1);
const style = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }]
}));
// onPressIn: scale.value = withSpring(0.97, { stiffness: 300, damping: 20 })
// onPressOut: scale.value = withSpring(1.00)
// Note: mobile uses scale DOWN (0.97) not UP (1.015) — feels more natural on touch
```

### Bottom sheet entry
```ts
entering={SlideInDown.springify().damping(20).stiffness(300)}
exiting={SlideOutDown.duration(250)}
```

### Skeleton → content transition (AnimatedContent)
```ts
// Skeleton: FadeIn/FadeOut 200ms
// Content: FadeInUp 400ms after skeleton exits
// Use AnimatePresence (from @legendapp/motion or custom) with mode="wait"
```

### Skeleton shimmer
```ts
// Animated shimmer using LinearGradient + looping translateX
// Dark mode: #272727 base → #333 shimmer
// Light mode: #F5F5F5 base → #E5E7EB shimmer
// 1.5s loop, ease in-out
```

---

## 11. Mobile-Specific UX Patterns

These have no direct web equivalent — mobile-only.

### Pull to refresh
Every list screen supports pull-to-refresh:
```ts
<FlatList
  refreshControl={
    <RefreshControl
      refreshing={isRefetching}
      onRefresh={() => refetch()}
      tintColor="#4F9D7E"  // primary green spinner
    />
  }
/>
```

### Swipe actions on payment rows
```ts
// Swipe right → "Mark Paid" (green bg)
// Swipe left  → "Delete" (red bg)
// Use react-native-swipeable or @shopify/flash-list with swipe support
```

### Haptic feedback on key actions
```ts
import * as Haptics from 'expo-haptics';

// On payment recorded: Haptics.notificationAsync(NotificationFeedbackType.Success)
// On deletion: Haptics.notificationAsync(NotificationFeedbackType.Warning)
// On button press: Haptics.impactAsync(ImpactFeedbackStyle.Light)
```

### Tap-to-call
```ts
// On tenant detail and in home "Needs Attention" rows:
<TouchableOpacity onPress={() => Linking.openURL(`tel:${tenant.phone}`)}>
  <Text>Call</Text>
</TouchableOpacity>
```

### Keyboard-aware scroll
```ts
// Wrap all forms in KeyboardAvoidingView so the keyboard doesn't hide inputs
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
  <ScrollView keyboardShouldPersistTaps="handled">
    {form fields}
  </ScrollView>
</KeyboardAvoidingView>
```

### Bottom sheet forms
All "add" / "edit" flows should be **bottom sheets, not full-screen pushes** wherever possible:
- Record Payment → bottom sheet ✓
- Add Floor → bottom sheet ✓
- Add Unit → bottom sheet ✓
- Edit Property → full screen (too many fields)
- Add Tenant → full screen (too many fields)
- Add Property → full screen (multi-step wizard)

Use `@gorhom/bottom-sheet` — it's the standard, handles keyboard + gestures.

### Empty states
Each empty state should have:
1. A simple icon (not heavy illustration — keep it fast)
2. A short title ("No tenants yet")
3. One-line description ("Add your first tenant to get started.")
4. Primary action button

---

## 12. State Management

### React Query (server state)

```ts
const { data: properties, isLoading } = useQuery({
  queryKey: ['properties'],
  queryFn: () => propertiesApi.list(),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  refetchOnWindowFocus: true,  // on mobile = refetch when app comes to foreground
});
```

**staleTime per resource:**

| Resource | staleTime | Why |
|---|---|---|
| Properties list | 60s | Changes infrequently |
| Property detail | 30s | Slightly more dynamic |
| Tenants list | 60s | — |
| Dashboard stats | 30s | Users check frequently |
| Payments list | 20s | Changes often |
| Auth user (`/me`) | 5min | Almost never changes |

**Cache invalidation after mutations:**
```ts
queryClient.invalidateQueries({ queryKey: ['properties'] });      // after add/edit property
queryClient.invalidateQueries({ queryKey: ['tenants'] });         // after add/edit tenant
queryClient.invalidateQueries({ queryKey: ['payments'] });        // after record payment
queryClient.invalidateQueries({ queryKey: ['dashboard'] });       // after any mutation
```

### Zustand (local state only)

```ts
// auth-store.ts — same as web, AsyncStorage instead of localStorage
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => AsyncStorage) }
  )
);
```

Zustand is ONLY for: auth session, theme preference (dark/light), selected property context.
Everything else → React Query.

---

## 13. API Client

```ts
// lib/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30_000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('access_token');
      // redirect to login
    }
    return Promise.reject(error);
  }
);
```

Tokens in `expo-secure-store` only (encrypted). Never AsyncStorage for tokens.

---

## 14. Folder Structure

```
stayoid-app/
├── app/
│   ├── _layout.tsx                  # Root: providers, fonts, theme
│   ├── index.tsx                    # Redirect → (tabs) or (auth)/login
│   ├── (auth)/
│   │   ├── _layout.tsx              # Auth layout — no tab bar
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   └── (tabs)/
│       ├── _layout.tsx              # Tab bar + OnboardingGate + FAB
│       ├── index.tsx                # Home / Dashboard
│       ├── properties/
│       │   ├── index.tsx            # Properties list
│       │   ├── new.tsx              # Add property (wizard)
│       │   └── [slug]/
│       │       ├── index.tsx        # Property detail (tabs: Floors/Tenants/Payments)
│       │       └── edit.tsx
│       ├── payments/
│       │   ├── index.tsx            # Payments list
│       │   └── new.tsx              # Record payment (used as modal too)
│       └── more/
│           ├── index.tsx            # More tab root (settings list)
│           ├── tenants/
│           │   ├── index.tsx        # Tenants list
│           │   ├── new.tsx          # Add tenant
│           │   └── [slug].tsx       # Tenant detail
│           └── settings/
│               ├── index.tsx        # Settings root
│               ├── profile.tsx
│               └── appearance.tsx
│
├── components/
│   ├── ui/                          # Primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── skeleton.tsx
│   │   ├── bottom-sheet.tsx         # Wraps @gorhom/bottom-sheet
│   │   ├── avatar.tsx               # Initials circle
│   │   └── empty-state.tsx
│   ├── home/
│   │   ├── collection-card.tsx      # Monthly collection progress
│   │   ├── stat-mini-card.tsx       # 2x2 occupancy / properties
│   │   ├── attention-row.tsx        # "Needs attention" alert row
│   │   └── quick-actions.tsx
│   ├── properties/
│   │   ├── property-card.tsx
│   │   ├── add-property-card.tsx
│   │   ├── floor-section.tsx        # Floor label + room grid
│   │   └── room-chip.tsx            # Single room square (occupied/vacant)
│   ├── payments/
│   │   ├── payment-row.tsx          # Swipeable payment list row
│   │   ├── payment-stats-strip.tsx  # Collection rate banner
│   │   └── record-payment-sheet.tsx # Bottom sheet form
│   ├── tenants/
│   │   ├── tenant-row.tsx           # Contact-style tenant card
│   │   └── tenant-profile-card.tsx  # Detail screen header card
│   └── shared/
│       ├── page-header.tsx
│       ├── screen-header.tsx        # Back + title for push screens
│       ├── status-badge.tsx
│       ├── fab.tsx                  # Global floating action button
│       ├── motion.tsx               # PageTransition, StaggerGrid, etc.
│       └── month-navigator.tsx      # ← April 2026 → chevron control
│
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── properties.ts
│   │   ├── floors.ts
│   │   ├── units.ts
│   │   ├── tenants.ts
│   │   ├── payments.ts
│   │   └── dashboard.ts
│   ├── hooks/
│   │   ├── use-properties.ts
│   │   ├── use-floors.ts
│   │   ├── use-units.ts
│   │   ├── use-tenants.ts
│   │   ├── use-payments.ts
│   │   └── use-dashboard.ts
│   ├── stores/
│   │   └── auth-store.ts
│   ├── constants/
│   │   ├── api.ts
│   │   └── routes.ts
│   └── utils/
│       └── formatters.ts
│
├── types/                           # Same as web
│   ├── property.ts
│   ├── tenant.ts
│   └── payment.ts
│
├── tailwind.config.js               # NativeWind tokens
└── app.json
```

---

## 15. Screen Inventory

| Screen | Route | Primary user job | Data |
|---|---|---|---|
| Splash | auto | App loads | — |
| Onboarding slides | auto (first launch) | Understand the app | — |
| Login | `/(auth)/login` | Sign in | — |
| Signup | `/(auth)/signup` | Create account | — |
| Forgot Password | `/(auth)/forgot-password` | Reset password | — |
| Home | `/(tabs)/` | Today's overview + quick actions | dashboard stats |
| Onboarding Setup | bottom sheet | Add first property | — |
| Properties list | `/(tabs)/properties/` | Check occupancy | properties + stats |
| Add Property | `/(tabs)/properties/new` | Create property | — |
| Property detail | `/(tabs)/properties/[slug]/` | See rooms, add floor | property + floors + stats |
| Payments list | `/(tabs)/payments/` | Who paid, who didn't | payments (paginated) |
| Record Payment | bottom sheet (from FAB / header) | Mark someone as paid | tenants list |
| More tab | `/(tabs)/more/` | Navigate to tenants, settings | — |
| Tenants list | `/(tabs)/more/tenants/` | Find a tenant | tenants |
| Add Tenant | `/(tabs)/more/tenants/new` | Add tenant to room | properties |
| Tenant detail | `/(tabs)/more/tenants/[slug]` | View + call + payment history | tenant + payments |
| Settings | `/(tabs)/more/settings/` | Account management | user profile |

---

## 16. Setup Commands

```bash
# Create app
npx create-expo-app@latest stayoid-app --template blank-typescript

# Navigation + routing
npx expo install expo-router

# Auth + secure storage
npx expo install expo-secure-store expo-font expo-image

# State + data
npm install zustand @tanstack/react-query axios

# Forms
npm install react-hook-form zod @hookform/resolvers

# UI + styling
npm install nativewind tailwindcss
npx tailwindcss init

# Animations
npx expo install react-native-reanimated react-native-gesture-handler

# Bottom sheets
npm install @gorhom/bottom-sheet

# Haptics
npx expo install expo-haptics

# Fonts
npx expo install @expo-google-fonts/inter @expo-google-fonts/playfair-display

# NativeWind setup
npx tailwindcss init
```

**`.env`:**
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 17. Web → Mobile Translation Reference

| Concern | Web (Next.js) | Mobile (Expo) |
|---|---|---|
| Auth tokens | httpOnly cookie + localStorage | `expo-secure-store` only |
| Navigation | App Router file-based | Expo Router (identical API) |
| Sidebar | Collapsible sidebar | Bottom tab bar + More tab |
| Lists | CSS grid + HTML table | `FlatList` with `renderItem` |
| Animations | Framer Motion | React Native Reanimated 3 |
| Images | `next/image` | `expo-image` |
| Fonts | CSS `@font-face` | `expo-google-fonts` |
| Theme | `next-themes` (CSS class) | Zustand + NativeWind `colorScheme` |
| Modals / dialogs | Radix Dialog | `@gorhom/bottom-sheet` |
| Toast / notifications | Sonner | `react-native-toast-message` |
| Charts | Recharts | `victory-native` or skip (use numbers instead) |
| Middleware / auth guard | `proxy.ts` (server-side) | Root `_layout.tsx` redirect logic |
| Storage (non-sensitive) | localStorage | AsyncStorage |
| Tokens (sensitive) | httpOnly cookie | SecureStore (encrypted) |
| Call phone number | Not applicable | `Linking.openURL('tel:...')` |
| Pull to refresh | Not applicable | `RefreshControl` in FlatList |
| Swipe actions | Not applicable | react-native-swipeable |
| Haptics | Not applicable | `expo-haptics` |
| Keyboard handling | Browser native | `KeyboardAvoidingView` |
| Landing page | `app/page.tsx` | Onboarding slides (replaced) |

---

## 18. Performance Checklist

- [ ] `FlatList` everywhere — never `ScrollView` + `.map()` for long lists
- [ ] `keyExtractor` uses `id`, never index
- [ ] `getItemLayout` on payment list (fixed row height → fast scroll)
- [ ] `expo-image` (not RN Image) — disk cache built in
- [ ] `React.memo()` on PropertyCard, TenantRow, PaymentRow, RoomChip
- [ ] `useCallback` on all handlers passed to list items
- [ ] React Query `staleTime` configured per resource
- [ ] Fetch per-tab only — Dashboard fetches dashboard, Properties fetches properties list
- [ ] `InteractionManager.runAfterInteractions` for heavy ops after tab switch
- [ ] Reanimated: never inline style objects inside render — always `useAnimatedStyle`
- [ ] `useMemo` for filtered/sorted lists and stats maps
- [ ] Skeleton heights match real content — avoids layout shift on load
- [ ] `@shopify/flash-list` instead of `FlatList` if list performance is slow (100+ items)





