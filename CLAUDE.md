# Stayoid Mobile — Claude Reference

React Native (Expo) mobile app for **Stayoid**, a property management SaaS for PG/hostel/apartment owners in India.

**Backend:** Django REST API at `../stayoid-backend/` — JWT auth, Bearer token in header  
**Web app:** Next.js at `../stayoid-website/` — same API, same data model  
**Full plan:** `app-design-temp/app-plan.md` — read this before building anything

---

## Tech Stack

- **Expo** (managed workflow) + **Expo Router** (file-based routing, same as Next.js App Router)
- **NativeWind** (Tailwind CSS for React Native)
- **Zustand** — local state only (auth session, theme)
- **TanStack React Query 5** — all server state (properties, tenants, payments)
- **React Hook Form + Zod** — forms and validation
- **Axios** — HTTP client with interceptors
- **React Native Reanimated 3** — animations
- **@gorhom/bottom-sheet** — bottom sheet forms and modals
- **expo-secure-store** — token storage (encrypted, never AsyncStorage for tokens)
- **expo-haptics** — haptic feedback on key actions
- **Fonts:** Inter (body) + Playfair Display (brand headings) via `@expo-google-fonts`

---

## Data Model

```
Property (PG / HOSTEL / APARTMENT)
  └── Floor  (floor_number: -2=basement, 0=ground, 1=first, ...)
        └── Unit  (physical room — unit_number e.g. "101")
              └── Slot  (occupancy unit — monthly_rent lives here)
                    └── Tenant (one active tenant per slot)
```

Slugs used everywhere in navigation — same as web app.

---

## Auth

- `POST /api/auth/login` — returns `{ access, refresh }` in response body (no cookies on mobile)
- Store `access_token` in `expo-secure-store`, `refresh_token` in `expo-secure-store`
- Axios request interceptor attaches `Authorization: Bearer {access_token}`
- On 401: try `POST /api/auth/refresh` (send `refresh` in body), else clear tokens + redirect to login
- **Do NOT use `?client=web`** query param — that's for the web app's cookie flow

---

## Navigation

```
app/
├── index.tsx                    # Redirect → (tabs) or (auth)/login
├── (auth)/                      # No tab bar
│   ├── login.tsx
│   ├── signup.tsx
│   └── forgot-password.tsx
└── (tabs)/                      # Protected — bottom tab bar
    ├── _layout.tsx              # Tab bar + FAB + OnboardingGate
    ├── index.tsx                # Home / Today dashboard
    ├── properties/
    │   ├── index.tsx
    │   ├── new.tsx
    │   └── [slug]/index.tsx
    ├── payments/
    │   └── index.tsx
    └── more/
        ├── index.tsx            # More tab root
        ├── tenants/
        │   ├── index.tsx
        │   ├── new.tsx
        │   └── [slug].tsx
        └── settings/index.tsx
```

**Bottom tabs:** Home | Properties | Payments | More  
**Settings** is inside More tab, not a separate tab.

---

## Key API Endpoints

| Screen | API calls |
|---|---|
| Home | `GET /api/dashboard/` + `GET /api/tenants/?unpaid=true` |
| Properties list | `GET /api/properties/` + `GET /api/dashboard/` |
| Property detail (room grid) | `GET /api/slots/?property_id={id}` (flat endpoint, pre-joined) |
| Payments list | `GET /api/payments/?month=X&year=Y` + `GET /api/tenants/?unpaid=true&month=X&year=Y` |
| Record Payment | `GET /api/tenants/?active=true` (search) + `POST /api/payments/` |
| Tenants list | `GET /api/tenants/` (filters: query, property_id, active, unpaid) |
| Tenant detail | `GET /api/tenants/{slug}/` + `GET /api/payments/?tenant_id={id}` |
| Add Tenant | `GET /api/slots/?property_id={id}&vacant=true` + `POST /api/tenants/` |

---

## What Does NOT Exist in the Backend

Do not build UI for these — no API backing:
- ❌ Reports / Export
- ❌ Push notifications
- ❌ Payment reminders (automated)
- ❌ Property/tenant photo upload (URL field exists, no upload endpoint)
- ❌ In-app messaging

---

## Design Tokens

```ts
// Dark mode defaults (primary theme)
background: '#0F0F0F'
card:       '#181818'
border:     '#272727'
foreground: '#FAFAFA'
muted:      '#272727'
mutedFg:    '#A3A3A3'

// Brand (same in light + dark)
primary:     '#4F9D7E'   // Stayoid green
secondary:   '#E8D4B8'   // warm beige
accent:      '#9B9FCE'   // soft purple
success:     '#22C55E'
warning:     '#F59E0B'
destructive: '#EF4444'
```

Radius: `sm=8, md=10, lg=12, xl=16, full=999`  
Spacing: 4px grid — `xs=4, sm=8, md=12, base=16, lg=20, xl=24`

---

## Onboarding Gate

No DB flag. Detect first-time user by checking `GET /api/properties/` count === 0.  
Show 4-step bottom sheet (type → name → floors → rooms).  
Dismiss is session-level (`useState`) — resets on app restart so users without properties are reminded.  
On completion: `queryClient.invalidateQueries(['properties'])`.

---

## Conventions

- **Slugs, not IDs** in navigation — `router.push('/properties/sunrise-pg')`
- **No direct API calls in screens** — screen → hook → `lib/api/*`
- **React Query for everything from API** — Zustand only for auth session + theme
- **Bottom sheets for quick forms** — Record Payment, Add Floor, Add Unit
- **Full-screen push for long forms** — Add Property, Add Tenant, Edit Property
- **Haptics on key actions** — success notification on payment recorded, impact on button press
- **Pull-to-refresh on every list** — `RefreshControl` with primary green tint

---

## Running Locally

```bash
npm install
npx expo start
```

Requires `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api
```

For device testing on physical phone: use your local IP instead of `localhost`.
