# PaintVerse System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React + TypeScript                            │
│                   (Port 8080 - Vite)                            │
└────────────┬────────────────────────────────┬───────────────────┘
             │                                │
             │                                │
             ▼                                ▼
┌────────────────────────┐      ┌────────────────────────────────┐
│   EXPRESS BACKEND      │      │      SUPABASE PLATFORM         │
│   (Port 5000)          │      │                                │
│                        │      │  ┌──────────────────────────┐  │
│  ┌──────────────────┐ │      │  │  Edge Function (Deno)    │  │
│  │  Auth (JWT)      │ │      │  │  visualize-room          │  │
│  │  - Login         │ │      │  │                          │  │
│  │  - Register      │ │      │  │  Actions:                │  │
│  └──────────────────┘ │      │  │  - analyze (Gemini 2.5)  │  │
│                        │      │  │  - visualize (Gemini)    │  │
│  ┌──────────────────┐ │      │  └──────────┬───────────────┘  │
│  │  Products API    │ │      │             │                   │
│  │  - CRUD          │ │      │             ▼                   │
│  │  - Inventory     │ │      │  ┌──────────────────────────┐  │
│  └──────────────────┘ │      │  │  Storage Bucket          │  │
│                        │      │  │  room-images/            │  │
│  ┌──────────────────┐ │      │  │  - uploads/              │  │
│  │  Orders API      │ │      │  │  - visualized/           │  │
│  │  - POS           │ │      │  └──────────────────────────┘  │
│  │  - Transactions  │ │      │                                │
│  └──────────────────┘ │      │  ┌──────────────────────────┐  │
│                        │      │  │  AI Gateway              │  │
│  ┌──────────────────┐ │      │  │  (Lovable)               │  │
│  │  Painters API    │ │      │  │                          │  │
│  │  - Jobs          │ │      │  │  - Gemini 2.5 Flash      │  │
│  │  - Reviews       │ │      │  │  - Gemini 2.5 Flash Img  │  │
│  └──────────────────┘ │      │  └──────────────────────────┘  │
│                        │      └────────────────────────────────┘
│  ┌──────────────────┐ │
│  │  PostgreSQL DB   │ │
│  │  (Prisma ORM)    │ │
│  └──────────────────┘ │
└────────────────────────┘
```

## Data Flow by Feature

### 1. User Authentication Flow
```
User Login
    ↓
Frontend → POST /api/auth/login → Express Backend
                                        ↓
                                   Validate credentials
                                        ↓
                                   Generate JWT token
                                        ↓
                                   Return user + token
    ↓
Store in localStorage
    ↓
Redirect to role-based dashboard
```

### 2. Product Management Flow
```
Dealer adds product
    ↓
Frontend → POST /api/products → Express Backend
                                      ↓
                                 Authenticate JWT
                                      ↓
                                 Authorize (dealer role)
                                      ↓
                                 Save to PostgreSQL
                                      ↓
                                 Return product data
```

### 3. AI Room Visualizer Flow (SUPABASE ONLY)
```
User uploads room photo
    ↓
Frontend → Supabase Storage → Upload image
                                    ↓
                               Get public URL
    ↓
Frontend → Supabase Edge Function (analyze)
                ↓
           Call Gemini 2.5 Flash API
                ↓
           Analyze room (walls, damage, type)
                ↓
           Return analysis JSON
    ↓
User selects paint color
    ↓
Frontend → Supabase Edge Function (visualize)
                ↓
           Call Gemini 2.5 Flash Image API
                ↓
           Generate painted room image
                ↓
           Upload to Supabase Storage
                ↓
           Return visualized image URL
    ↓
Display before/after comparison
```

### 4. POS Order Flow
```
Dealer scans products
    ↓
Add to cart (frontend state)
    ↓
Complete sale
    ↓
Frontend → POST /api/orders → Express Backend
                                    ↓
                               Authenticate JWT
                                    ↓
                               Authorize (dealer role)
                                    ↓
                               Create order in DB
                                    ↓
                               Reduce product stock
                                    ↓
                               Return order + receipt
```

## API Endpoints Map

### Express Backend (localhost:5000/api)

| Endpoint | Method | Auth | Role | Purpose |
|----------|--------|------|------|---------|
| `/auth/register` | POST | No | - | Create new user |
| `/auth/login` | POST | No | - | Login & get JWT |
| `/products` | GET | No | - | List all products |
| `/products/dealer` | GET | Yes | dealer | Get dealer's products |
| `/products` | POST | Yes | dealer | Create product |
| `/products/:id` | PUT | Yes | dealer/admin | Update product |
| `/products/:id` | DELETE | Yes | dealer/admin | Delete product |
| `/orders` | POST | Yes | dealer | Create POS order |
| `/orders` | GET | Yes | dealer/admin | Get orders |
| `/painters/all` | GET | No | - | List all painters |
| `/painters` | POST | Yes | customer | Create painting job |
| `/painters` | GET | Yes | painter/customer | Get jobs |
| `/painters/reviews` | GET | Yes | painter | Get reviews |
| `/painters/:id/status` | PATCH | Yes | painter/customer/admin | Update job status |

### Supabase Edge Functions

| Function | Action | Purpose |
|----------|--------|---------|
| `visualize-room` | analyze | AI room analysis (Gemini 2.5 Flash) |
| `visualize-room` | visualize | AI room painting (Gemini 2.5 Flash Image) |

### Supabase Storage

| Bucket | Path | Purpose |
|--------|------|---------|
| `room-images` | `/uploads/` | User uploaded room photos |
| `room-images` | `/visualized/` | AI-generated painted rooms |

## Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** TailwindCSS + shadcn/ui
- **State:** React Context + TanStack Query
- **Routing:** React Router v6
- **Animations:** Framer Motion

### Express Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Auth:** JWT + bcrypt
- **Validation:** Manual

### Supabase (AI Only)
- **Runtime:** Deno (Edge Functions)
- **Storage:** Supabase Storage (S3-compatible)
- **AI:** Google Gemini via Lovable AI Gateway
- **CDN:** Automatic via Supabase

## Environment Variables

### Frontend (.env)
```env
# Express Backend
VITE_API_URL=http://localhost:5000/api

# Supabase (AI Visualizer only)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
VITE_SUPABASE_PROJECT_ID=xxx
```

### Express Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/paintverse
JWT_SECRET=your_secret_key
PORT=5000
```

### Supabase Edge Function (Set in Supabase Dashboard)
```env
LOVABLE_API_KEY=your_lovable_api_key
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema (PostgreSQL)

```
users
├── id (uuid)
├── email (unique)
├── password (hashed)
├── role (customer/dealer/painter/admin)
└── timestamps

profiles
├── id (uuid)
├── userId (fk → users)
├── fullName
├── avatarUrl
├── phone
└── timestamps

products
├── id (uuid)
├── dealerId (fk → users)
├── name
├── sku
├── category
├── brand
├── colorHex
├── price
├── stockQuantity
└── timestamps

pos_orders
├── id (uuid)
├── dealerId (fk → users)
├── orderNumber
├── customerName
├── total
├── paymentMethod
└── timestamps

pos_order_items
├── id (uuid)
├── orderId (fk → pos_orders)
├── productId (fk → products)
├── quantity
├── unitPrice
└── totalPrice

painter_jobs
├── id (uuid)
├── painterId (fk → users)
├── customerId (fk → users)
├── location
├── jobType
├── estimatedCost
├── status
└── timestamps

painter_reviews
├── id (uuid)
├── painterId (fk → users)
├── customerId (fk → users)
├── jobId (fk → painter_jobs)
├── rating
├── comment
└── timestamps
```

## Security

### Express Backend
- ✅ JWT token authentication
- ✅ Password hashing (bcrypt)
- ✅ Role-based authorization
- ✅ CORS enabled
- ⚠️ No rate limiting (should add)
- ⚠️ No input validation library (should add Zod)

### Supabase
- ✅ CORS headers configured
- ✅ Service role key for storage
- ✅ Public read access for images
- ✅ Edge function authentication via API key

## Deployment Strategy

### Express Backend
**Options:** Heroku, Railway, Render, AWS EC2, DigitalOcean
**Requirements:**
- Node.js 18+
- PostgreSQL database
- Environment variables

### Frontend
**Options:** Vercel, Netlify, Cloudflare Pages
**Requirements:**
- Static hosting
- Environment variables for both backends

### Supabase
**Already Deployed:** Edge functions and storage are on Supabase cloud
**Update via:** `supabase functions deploy visualize-room`

## Cost Breakdown

### Express Backend
- **Hosting:** $5-25/month (Railway, Render)
- **Database:** $5-15/month (managed PostgreSQL)
- **Total:** ~$10-40/month

### Supabase
- **Free Tier:** 1GB storage, 500K function calls
- **Paid:** $25/month (Pro plan)
- **AI Gateway:** Pay-per-use (Gemini API calls)

### Total Estimated Cost
- **Development:** Free (local + Supabase free tier)
- **Production:** $35-65/month + AI usage

## Why Two Backends?

### Advantages
✅ Separation of concerns (business logic vs AI features)
✅ Serverless AI without managing infrastructure
✅ Automatic scaling for AI workloads
✅ CDN for images included
✅ No AI model management needed

### Disadvantages
❌ Two services to maintain
❌ Additional complexity
❌ Two sets of environment variables
❌ Potential vendor lock-in for AI features

### When to Consolidate
Consider moving everything to Express if:
- You want to self-host AI models
- You need full control over AI pipeline
- You want to reduce service dependencies
- Cost becomes a concern

Consider moving everything to Supabase if:
- You want fully managed solution
- You prefer serverless architecture
- You want to use Supabase Auth
- You want real-time features (Supabase Realtime)
