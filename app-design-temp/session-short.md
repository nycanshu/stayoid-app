# Stayoid — Session Reference

> Single document covering everything built in the web session.
> Designed to be the starting reference for the mobile app so you don't repeat decisions.

---

## 1. What We Built (Website Session Summary)

| Area | What was done |
|---|---|
| **Password validation** | Backend: `validate_password()` on signup + reset. Frontend: 3 live pill indicators (8+ chars / one letter / one number) using `watch('password')` on react-hook-form. Show only when field has content. |
| **Onboarding gate** | Removed Zustand `onboarding_completed` flag. Now checks `useProperties().data.results.length === 0`. Gate is a full-screen overlay; dismiss is session-level `useState` (resets on refresh = good). Completion calls `queryClient.invalidateQueries(['properties'])`. |
| **404 page** | `app/not-found.tsx` — branded with Stayoid logo, "Go home" + "Dashboard" buttons. |
| **Error boundary** | `app/error.tsx` — `'use client'`, shows reset button, global catch. |
| **OG image** | `app/opengraph-image.tsx` — `ImageResponse` 1200×630, dark bg, green dot, Stayoid wordmark, green bottom bar. `runtime = 'edge'`. |
| **Blog / Contentful CMS** | `lib/contentful.ts` — Contentful SDK, `getAllPosts()` / `getPostBySlug()` / `getAllPostSlugs()`. ISR `revalidate = 3600`. Rich text renderer with custom Tailwind styles. Blog index + [slug] pages added. |
| **Nav / Footer links** | Removed "How it works". Added "Blog" → `/blog`. Final navbar: Features · Pricing · About · Blog · FAQ. Footer company section: About · Blog · Contact. |
| **Email — password reset** | Switched from console to Gmail SMTP. Branded email template. `python-decouple` for env loading. |
| **Contentful MCP** | Added `@contentful/mcp-server` to `.mcp.json` — can create/publish blog posts from Claude Code directly. |
| **Mobile app plan** | Created `app-design-temp/app-plan.md` + `CLAUDE.md` in `stayoid-app/`. Full UX redesign, API map, feature table. |

---

## 2. Icons

**Library:** `@phosphor-icons/react` — all icons come from here. No Lucide.  
**Usage:** Import from `@/lib/icons` → `Icons.xxx`. Never import Phosphor directly in components.

```ts
import { Icons } from '@/lib/icons';
// Then use:
<Icons.add className="h-4 w-4" />
```

**Full registry:**

| Key | Phosphor component | Used for |
|---|---|---|
| `dashboard` | `SquaresFour` | Sidebar nav — Dashboard |
| `properties` | `Buildings` | Sidebar nav — Properties |
| `tenants` | `Users` | Sidebar nav — Tenants |
| `payments` | `CreditCard` | Sidebar nav — Payments |
| `beds` | `Bed` | PG property type icon |
| `settings` | `GearSix` | Sidebar nav — Settings |
| `add` | `Plus` | Add / create buttons |
| `edit` | `PencilSimple` | Edit buttons |
| `delete` | `Trash` | Delete buttons |
| `back` | `ArrowLeft` | Back navigation |
| `forward` | `ArrowRight` | Forward |
| `arrowUpRight` | `ArrowUpRight` | External links |
| `more` | `DotsThree` | Dropdown "..." menus |
| `chevronRight` | `CaretRight` | List row arrows |
| `chevronsUpDown` | `CaretUpDown` | Select triggers |
| `search` | `MagnifyingGlass` | Search inputs |
| `close` | `X` | Close / dismiss |
| `menu` | `List` | Mobile menu toggle |
| `loader` | `CircleNotch` | Loading spinner (animate-spin) |
| `check` | `Check` | Success / checkmark |
| `checkCircle` | `CheckCircle` | Success states |
| `warning` | `WarningCircle` | Warnings / alerts |
| `trendUp` | `TrendUp` | Revenue / growth indicators |
| `calendar` | `CalendarBlank` | Date fields |
| `mail` | `Envelope` | Email fields |
| `phone` | `Phone` | Phone fields |
| `lock` | `Lock` | Password / security |
| `key` | `Key` | Auth / key actions |
| `shield` | `ShieldCheck` | Security / trust |
| `signOut` | `SignOut` | Logout |
| `eye` | `Eye` | Show password |
| `eyeOff` | `EyeSlash` | Hide password |
| `briefcase` | `Briefcase` | Work / employment |
| `mapPin` | `MapPin` | Address / location |
| `door` | `Door` | Room / unit (alternative) |
| `layers` | `Stack` | Floors tab |
| `cube` | `Cube` | Units |
| `database` | `Database` | Data & sync settings |
| `currencyInr` | `CurrencyInr` | Rupee / payments |
| `user` | `User` | Single user / profile |
| `sun` | `Sun` | Light theme toggle |
| `moon` | `Moon` | Dark theme toggle |
| `monitor` | `Monitor` | System theme toggle |
| `palette` | `Palette` | Appearance settings |
| `refresh` | `ArrowsClockwise` | Refresh / sync |
| `twitter` | `XLogo` | Social — X/Twitter |
| `linkedin` | `LinkedinLogo` | Social — LinkedIn |
| `instagram` | `InstagramLogo` | Social — Instagram |
| `facebook` | `FacebookLogo` | Social — Facebook |
| `house` | `House` | Flat property type icon / landing |
| `car` | `Car` | Landing page feature |
| `wifi` | `WifiHigh` | Landing page feature |
| `waves` | `Waves` | Landing page feature |
| `fileEdit` | `NotePencil` | Landing page feature |

**For React Native (mobile):**  
Phosphor has an official `@phosphor-icons/react-native` package — exact same icon names, same API. Install it and the Icons registry pattern carries over 1:1.

```bash
npm install phosphor-react-native react-native-svg
```

---

## 3. Design Tokens — Exact Values

### Colors (light mode → dark mode)

| Token | Light | Dark | Notes |
|---|---|---|---|
| `background` | `#F8F9FB` | `#0F0F0F` | Page background |
| `card` | `#FFFFFF` | `#181818` | Card surfaces |
| `border` | `#E5E7EB` | `#272727` | All borders |
| `muted` | `#F5F5F5` | `#272727` | Muted backgrounds |
| `muted-foreground` | `#737373` | `#A3A3A3` | Subtle text |
| `foreground` | `#1E1E1E` | `#FAFAFA` | Primary text |
| `primary` | `#4F9D7E` | `#4F9D7E` | Stayoid green (same both) |
| `primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `secondary` | `#E8D4B8` | `#E8D4B8` | Warm beige |
| `accent` | `#9B9FCE` | `#9B9FCE` | Soft purple |
| `success` | `#22C55E` | `#22C55E` | — |
| `success-light` | `#DCFCE7` | `#1E3C28` | Badge backgrounds |
| `warning` | `#F59E0B` | `#F59E0B` | — |
| `warning-light` | `#FEF3C7` | `#3C2D0F` | Badge backgrounds |
| `destructive` | `#EF4444` | `#EF4444` | Errors / delete |
| `info` | `#3B82F6` | `#60A5FA` | Info states |
| `info-light` | `#DBEAFE` | `#192841` | Badge backgrounds |
| `chart-1..5` | green / purple / beige / blue / orange | same | Chart colors in order |

### Typography

| Font | Variable | Used for |
|---|---|---|
| **Inter** | `--font-sans` | Body, labels, buttons, everything default |
| **Playfair Display** | `--font-serif` → `--font-brand` | Section headings, card titles, landing hero |
| **Geist Mono** | `--font-mono` | Code, unit numbers if needed |

In Tailwind: `font-sans` = Inter, `[font-family:var(--font-brand)]` = Playfair Display.

### Border Radius

`--radius: 0.75rem` (12px)

| Class | Size | Used for |
|---|---|---|
| `rounded-sm` | 4px | Very small elements |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | — |
| `rounded-xl` | 12px | Dashboard cards |
| `rounded-2xl` | 16px | Landing cards, large modals |
| `rounded-full` | 999px | Badges, avatars, pill buttons |

---

## 4. Property Type Meta

The web uses `PROPERTY_TYPE_META` to derive labels and icons per property type.  
Replicate this pattern in the mobile app.

| Backend value | Short label | Long label | Icon key | Icon color |
|---|---|---|---|---|
| `PG` | PG | PG (Paying Guest) | `beds` (Bed icon) | `success-light` bg / `success` text |
| `FLAT` | Flat | Flat / Apartment | `house` (House icon) | `info-light` bg / `info` text |

> ⚠️ **Discrepancy:** The backend API explorer returned `PG / HOSTEL / APARTMENT` as enum values, but the web frontend `types/enums.ts` uses `PG / FLAT`. The web is the live system — use `PG` and `FLAT` as the actual values. If `HOSTEL` or `APARTMENT` exist in the backend, the frontend hasn't surfaced them yet.

**Labels per property type** (used in tenant/payment rows):

| Type | Unit label | Slot label |
|---|---|---|
| PG | Room | Bed |
| FLAT | Flat | Room |

---

## 5. Payment Method Meta

| Backend value | Display label | Color tone |
|---|---|---|
| `UPI` | UPI | info (blue) |
| `CASH` | Cash | success (green) |
| `BANK` | Bank Transfer | warning (amber) |
| `CARD` | Card | danger (red) |
| `CHEQUE` | Cheque | neutral (muted) |
| `OTHER` | Other | neutral (muted) |

Badge pattern: `bg-{tone}-light text-{tone} border-{tone}/20 rounded-full text-xs px-2.5 py-1`

---

## 6. Status Badge Colors

| Status string | Background | Text |
|---|---|---|
| `Active` | `success-light` | `success` |
| `Exited` | `muted` | `muted-foreground` |
| `PAID` | `success-light` | `success` |
| `PARTIAL` | `warning-light` | `warning` |
| `PENDING` | `destructive/10` | `destructive` |

---

## 7. Enums — Exact Values

These are what the backend accepts and returns. Use these exact strings.

```ts
// Property types
PropertyType: 'PG' | 'FLAT'

// Gender
Gender: 'MALE' | 'FEMALE' | 'OTHER'

// Work type
WorkType: 'STUDENT' | 'IT' | 'BUSINESS' | 'GOVERNMENT' | 'HEALTHCARE' | 'OTHER'

// ID proof
IdProofType: 'AADHAR' | 'PAN' | 'PASSPORT' | 'DL' | 'VOTER' | 'OTHER'

// Payment method
PaymentMethod: 'CASH' | 'UPI' | 'BANK' | 'CARD' | 'CHEQUE' | 'OTHER'

// Payment status
PaymentStatus: 'PAID' | 'PARTIAL' | 'PENDING'

// Slot type
SlotType: 'BED' | 'MEMBER'

// Unit type
UnitType: 'ROOM' | 'FLAT'
```

---

## 8. API Reference — Every Endpoint

Base URL: `http://localhost:8000/api` (dev) — set via `NEXT_PUBLIC_API_URL` / `EXPO_PUBLIC_API_URL`

**Mobile auth note:** Never use `?client=web` query param. That's for the web's cookie flow.  
Mobile sends both tokens in request/response body and stores them in `expo-secure-store`.

---

### AUTH

| Method | Endpoint | Purpose | Auth required |
|---|---|---|---|
| POST | `/auth/signup/` | Create account → returns `{ access, refresh }` | No |
| POST | `/auth/login/` | Login → returns `{ access, refresh }` | No |
| POST | `/auth/refresh/` | Refresh access token. Send `{ refresh }` in body → returns `{ access }` | No |
| POST | `/auth/logout/` | Blacklist refresh token. Send `{ refresh }` in body | Yes |
| GET | `/auth/me/` | Current user profile: `{ id, email, name, avatar_url, created_at }` | Yes |
| PATCH | `/auth/me/` | Update name: `{ name }` | Yes |
| POST | `/auth/password/reset/` | Request reset email: `{ email }` | No |
| POST | `/auth/password/reset/confirm/` | Confirm reset: `{ uid, token, password }` | No |

---

### DASHBOARD

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/dashboard/` | Full portfolio stats for current month |
| GET | `/dashboard/?property_id={id}` | Stats scoped to one property |

**Response shape:**
```json
{
  "summary": {
    "total_properties": 3,
    "total_slots": 10,
    "occupied_slots": 5,
    "vacant_slots": 5,
    "occupancy_rate": 50.0,
    "active_tenants": 5
  },
  "current_month": {
    "month": 4, "year": 2026,
    "display": "April 2026",
    "expected_rent": "56500.00",
    "collected_rent": "48000.00",
    "pending_rent": "8500.00",
    "collection_rate": 84.9,
    "paid_count": 4,
    "pending_count": 1
  },
  "properties": [
    { "id": "uuid", "name": "Sunrise PG", "total_slots": 7, "occupied": 3, "vacant": 4,
      "expected_rent": "24500.00", "collected_rent": "16000.00" }
  ],
  "recent_payments": [
    { "id": "uuid", "tenant_name": "Anjali", "amount": "18000.00",
      "payment_date": "2026-04-10", "payment_method": "UPI", "property_name": "Himalaya Heights" }
  ]
}
```

---

### PROPERTIES

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/properties/` | List all properties (paginated) |
| POST | `/properties/` | Create property: `{ name, property_type, address }` |
| GET | `/properties/{id}/` | Get by UUID |
| PUT | `/properties/{id}/` | Update by UUID |
| DELETE | `/properties/{id}/` | Delete by UUID |
| GET | `/properties/by-slug/{slug}/` | Get by slug ← use this in mobile |
| PUT | `/properties/by-slug/{slug}/` | Update by slug |
| DELETE | `/properties/by-slug/{slug}/` | Delete by slug |

**Property list item:**
```json
{ "id": "uuid", "slug": "sunrise-pg", "name": "Sunrise PG",
  "property_type": "PG", "property_type_display": "PG",
  "address": "123 MG Road, Bangalore", "created_at": "...", "updated_at": "..." }
```

---

### FLOORS

All nested under a property. Use property's `id` (UUID), not slug.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/properties/{propertyId}/floors/` | List floors |
| POST | `/properties/{propertyId}/floors/` | Create floor: `{ floor_number, name? }` |
| GET | `/properties/{propertyId}/floors/{id}/` | Get floor |
| PUT | `/properties/{propertyId}/floors/{id}/` | Update floor |
| DELETE | `/properties/{propertyId}/floors/{id}/` | Delete floor |
| GET | `/properties/{propertyId}/floors/by-slug/{slug}/` | Get by slug |

**Floor object:**
```json
{ "id": "uuid", "slug": "ground-floor", "floor_number": 0, "name": "Ground",
  "created_at": "...", "updated_at": "..." }
```

**Floor number convention:** -2/-1 = basement, 0 = ground, 1 = first, 2 = second...

---

### UNITS

Nested under property → floor.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/properties/{pId}/floors/{fId}/units/` | List units |
| POST | `/properties/{pId}/floors/{fId}/units/` | Create: `{ unit_number, name?, capacity? }` |
| GET | `/properties/{pId}/floors/{fId}/units/{id}/` | Get unit |
| PUT | `/properties/{pId}/floors/{fId}/units/{id}/` | Update |
| DELETE | `/properties/{pId}/floors/{fId}/units/{id}/` | Delete |
| GET | `/properties/{pId}/floors/{fId}/units/by-slug/{slug}/` | Get by slug |

**Unit object:**
```json
{ "id": "uuid", "slug": "room-101", "unit_type": "ROOM",
  "unit_number": "101", "name": "Room 101", "capacity": 1 }
```

---

### SLOTS

Two ways to access:

**Flat endpoint (use for room grid):**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/slots/` | All slots across all properties |
| GET | `/slots/?property_id={id}` | Slots for one property ← for room grid |
| GET | `/slots/?vacant=true` | Only vacant slots ← for "assign tenant" picker |
| GET | `/slots/?property_id={id}&vacant=true` | Vacant slots in a specific property |

**Nested endpoint (use for adding/editing slots):**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/properties/{pId}/floors/{fId}/units/{uId}/slots/` | List slots |
| POST | `/properties/{pId}/floors/{fId}/units/{uId}/slots/` | Create: `{ slot_number, name?, monthly_rent }` |
| PUT | `/properties/{pId}/floors/{fId}/units/{uId}/slots/{id}/` | Update |
| DELETE | `/properties/{pId}/floors/{fId}/units/{uId}/slots/{id}/` | Delete |

**Slot object (flat endpoint — pre-joined):**
```json
{
  "id": "uuid", "slug": "bed-1",
  "slot_type": "BED", "slot_number": "1",
  "monthly_rent": "8000.00",
  "is_occupied": true,
  "unit_number": "101", "unit_slug": "room-101",
  "floor_number": 0, "floor_name": "Ground", "floor_slug": "ground-floor",
  "property_id": "uuid", "property_name": "Sunrise PG",
  "property_slug": "sunrise-pg", "property_type": "PG",
  "active_tenant": { "id": "uuid", "slug": "arjun-patel", "name": "Arjun Patel", "phone": "+91..." }
}
```

---

### TENANTS

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/tenants/` | List tenants (filterable) |
| POST | `/tenants/` | Create tenant (requires `slot_id`) |
| GET | `/tenants/{id}/` | Get tenant detail |
| PUT | `/tenants/{id}/` | Update tenant |
| DELETE | `/tenants/{id}/` | Delete tenant |
| POST | `/tenants/{id}/exit/` | Mark exited: `{ exit_date }` — frees the slot |

**Tenant list filters:**
```
?query=name_or_phone      — search by name, phone, or room number
?property_id=uuid         — filter by property
?active=true              — only active tenants
?active=false             — only exited tenants
?unpaid=true              — active tenants with no payment this month ← "Needs Attention"
?month=4&year=2026        — used with unpaid filter
?page=1&page_size=20
```

**Tenant list item:**
```json
{
  "id": "uuid", "slug": "anjali-kapoor",
  "name": "Anjali Kapoor", "phone": "+91 98765 43210",
  "gender": "FEMALE",
  "slot_number": "1", "slot_type": "BED",
  "monthly_rent": "18000.00",
  "unit_number": "101", "unit_type": "ROOM",
  "property_name": "Himalaya Heights", "property_slug": "himalaya-heights",
  "property_type": "PG",
  "join_date": "2026-01-12", "exit_date": null,
  "is_active": true,
  "deposit_amount": "20000.00"
}
```

**Tenant detail (extra fields):**
```json
{
  "slot_details": { "id", "slug", "slot_type", "monthly_rent", "unit": {...}, "floor": {...}, "property": {...} },
  "email": "...", "date_of_birth": "...", "photo_url": "...",
  "permanent_address": "...", "work_location": "...", "work_type": "STUDENT",
  "emergency_contact_name": "...", "emergency_contact_phone": "...",
  "id_proof_type": "AADHAR", "id_proof_number": "...",
  "description": "..."
}
```

**Create tenant required fields:**
```json
{ "slot_id": "uuid", "name": "...", "phone": "...", "gender": "MALE|FEMALE|OTHER",
  "permanent_address": "...", "join_date": "YYYY-MM-DD", "deposit_amount": "0.00" }
```

---

### PAYMENTS

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/payments/` | List payments (filterable, paginated) |
| POST | `/payments/` | Create payment record |
| GET | `/payments/{id}/` | Get payment |
| PUT | `/payments/{id}/` | Update payment |
| DELETE | `/payments/{id}/` | Delete payment |

**Payment list filters:**
```
?tenant_id=uuid
?property_id=uuid
?month=4              — 1–12
?year=2026
?status=PAID|PARTIAL|PENDING
?page=1&page_size=20
```

**Payment list item:**
```json
{
  "id": "uuid",
  "tenant_id": "uuid", "tenant_slug": "anjali-kapoor",
  "tenant_name": "Anjali Kapoor", "tenant_phone": "+91...",
  "property_name": "...", "property_slug": "...", "property_type": "PG",
  "unit_number": "101", "unit_type": "ROOM",
  "slot_number": "1", "slot_type": "BED",
  "amount": "18000.00",
  "payment_date": "2026-04-10",
  "payment_for_month": 4, "payment_for_year": 2026,
  "month_year_display": "April 2026",
  "payment_method": "UPI",
  "payment_status": "PAID"
}
```

**Create payment required fields:**
```json
{ "tenant_id": "uuid", "amount": "18000.00",
  "payment_date": "2026-04-10",
  "payment_for_month": 4, "payment_for_year": 2026,
  "payment_method": "UPI",
  "payment_status": "PAID"   // optional, default PAID
}
```

**Optional payment fields:** `transaction_id`, `collected_by`, `notes`

---

## 9. Key Patterns from the Web — Replicate in Mobile

### Service → Hook → Screen
Never call Axios directly in a component:
```
screen → usePayments() → lib/api/payments.ts → axios client
```

### Slug-first navigation
Always navigate with slugs, not UUIDs:
```ts
router.push(`/properties/${property.slug}`);
router.push(`/tenants/${tenant.slug}`);
```

### Cache invalidation after mutations
```ts
// After recording payment:
queryClient.invalidateQueries({ queryKey: ['payments'] });
queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// After adding tenant:
queryClient.invalidateQueries({ queryKey: ['tenants'] });
queryClient.invalidateQueries({ queryKey: ['slots'] });   // slot is now occupied
queryClient.invalidateQueries({ queryKey: ['dashboard'] });

// After tenant exit:
queryClient.invalidateQueries({ queryKey: ['tenants'] });
queryClient.invalidateQueries({ queryKey: ['slots'] });   // slot is now vacant
queryClient.invalidateQueries({ queryKey: ['dashboard'] });
```

### Property type meta pattern
Don't hardcode labels in UI. Use a lookup:
```ts
const meta = getPropertyTypeMeta(property.property_type);
// meta.shortLabel → "PG" / "Flat"
// meta.icon → the icon component
// meta.unitLabel → "Room" / "Flat"
// meta.slotLabel → "Bed" / "Room"
```

### staleTime defaults
```ts
properties:    60_000  // 60s
tenants:       60_000
dashboard:     30_000  // 30s — checked often
payments:      20_000  // 20s — changes often
auth/me:      300_000  // 5min
```

### Formatters (copy from web)
```ts
formatCurrency(18000)        → "₹18,000"
formatDate("2026-04-10")     → "10 Apr 2026"
formatPhone("+919876543210") → "+91 98765 43210"
```

---

## 10. What Does NOT Exist in the Backend (Do Not Build UI For)

| Feature | Status |
|---|---|
| Reports / Export to PDF/CSV | ❌ No endpoint |
| Push notifications | ❌ No backend support |
| Automated payment reminders | ❌ No backend support |
| Photo/image upload for property or tenant | ❌ No upload endpoint (`photo_url` accepts a string URL only) |
| In-app chat or messaging | ❌ No endpoint |
| Bulk tenant operations | ❌ No endpoint |
| Receipt generation / download | ❌ No endpoint |
