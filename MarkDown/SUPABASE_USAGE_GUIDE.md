# Supabase Usage in PaintVerse

## Overview

Your system uses **TWO SEPARATE BACKENDS**:

1. **Express Backend** (Port 5000) - Main API for authentication, products, orders, painters
2. **Supabase** - ONLY for AI Room Visualizer feature

This is a **hybrid architecture** where Supabase is used exclusively for the AI-powered room visualization feature.

---

## Where Supabase is Used

### 1. AI Room Visualizer Feature ONLY

**File:** `frontend/src/pages/visualizer/VisualizerPage.tsx`

Supabase is used for THREE specific purposes in the visualizer:

#### A. Image Storage
```typescript
// Upload user's room photo to Supabase Storage
const { error } = await supabase.storage
  .from("room-images")
  .upload(fileName, file);

// Get public URL for the uploaded image
const { data: publicUrlData } = supabase.storage
  .from("room-images")
  .getPublicUrl(fileName);
```

**Purpose:** Store user-uploaded room photos in Supabase Storage bucket

#### B. AI Room Analysis
```typescript
const { data, error } = await supabase.functions.invoke("visualize-room", {
  body: { imageUrl, action: "analyze" },
});
```

**Purpose:** Call Supabase Edge Function to analyze the room using Google Gemini 2.5 Flash AI
- Detects walls
- Identifies damage (cracks, stains, peeling, moisture)
- Determines room type
- Analyzes lighting conditions
- Calculates paintable area percentage
- Provides AI recommendations

#### C. AI Room Visualization
```typescript
const { data, error } = await supabase.functions.invoke("visualize-room", {
  body: {
    imageUrl: uploadedImageUrl,
    colorName: selectedColor.name,
    colorHex: selectedColor.hex,
    action: "visualize",
  },
});
```

**Purpose:** Call Supabase Edge Function to generate painted room visualization using Google Gemini 2.5 Flash Image model
- AI repaints walls with selected color
- Preserves furniture, floors, ceiling
- Maintains realistic lighting and shadows
- Returns visualized image URL

---

## Supabase Edge Function

**Location:** `backend/supabase/functions/visualize-room/index.ts`

This is a **Deno-based serverless function** deployed on Supabase that:

### Features:
1. **Room Analysis** (action: "analyze")
   - Uses Google Gemini 2.5 Flash (vision model)
   - Analyzes room photos for painting preparation
   - Returns structured JSON with room details

2. **Room Visualization** (action: "visualize")
   - Uses Google Gemini 2.5 Flash Image (image generation model)
   - Generates realistic painted room previews
   - Uploads result to Supabase Storage
   - Returns public URL

### AI Gateway:
```typescript
const response = await fetch(
  "https://ai.gateway.lovable.dev/v1/chat/completions",
  {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash", // or "google/gemini-2.5-flash-image"
      messages: [...]
    })
  }
);
```

**Note:** Uses Lovable AI Gateway to access Google Gemini models

---

## Why This Hybrid Architecture?

### Express Backend (Your Main API)
- ✅ User authentication (JWT)
- ✅ Product management
- ✅ Order processing
- ✅ Painter job management
- ✅ Database operations (PostgreSQL + Prisma)

### Supabase (AI Features Only)
- ✅ Serverless edge functions (Deno runtime)
- ✅ Image storage with CDN
- ✅ AI model integration (Gemini)
- ✅ Automatic scaling
- ✅ No server management needed

**Benefit:** You don't need to manage AI infrastructure or image storage on your Express server. Supabase handles the heavy lifting for AI features.

---

## Supabase Configuration

### Frontend Environment Variables
**File:** `frontend/.env`
```env
VITE_SUPABASE_PROJECT_ID="mowgblkqqbiwgixrvdhw"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
VITE_SUPABASE_URL="https://mowgblkqqbiwgixrvdhw.supabase.co"
```

### Supabase Edge Function Environment Variables
**Required in Supabase Dashboard:**
```env
LOVABLE_API_KEY=<your-lovable-api-key>
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Supabase Storage Buckets

### 1. `room-images` Bucket
**Purpose:** Store user-uploaded room photos and AI-generated visualizations

**Structure:**
```
room-images/
├── uploads/
│   ├── <uuid>.jpg    # User uploaded photos
│   ├── <uuid>.png
│   └── ...
└── visualized/
    ├── <uuid>.png    # AI-generated painted rooms
    └── ...
```

**Access:** Public read access (images are publicly accessible via URL)

---

## Data Flow: AI Room Visualizer

```
User uploads photo
       ↓
Frontend: Upload to Supabase Storage
       ↓
Get public URL
       ↓
Frontend: Call Supabase Edge Function (analyze)
       ↓
Edge Function: Send to Gemini 2.5 Flash
       ↓
AI analyzes room (walls, damage, type, etc.)
       ↓
Return analysis JSON to frontend
       ↓
User selects paint color
       ↓
Frontend: Call Supabase Edge Function (visualize)
       ↓
Edge Function: Send to Gemini 2.5 Flash Image
       ↓
AI generates painted room image
       ↓
Edge Function: Upload result to Supabase Storage
       ↓
Return visualized image URL to frontend
       ↓
Frontend: Display before/after comparison
```

---

## What Supabase is NOT Used For

❌ User authentication (uses Express + JWT instead)
❌ Product management (uses Express + PostgreSQL)
❌ Order processing (uses Express + PostgreSQL)
❌ Painter jobs (uses Express + PostgreSQL)
❌ Reviews (uses Express + PostgreSQL)
❌ Any CRUD operations (uses Express API)

**Only used for:** AI Room Visualizer feature

---

## Cost Implications

### Supabase Free Tier Includes:
- 500 MB database storage (not used in your case)
- 1 GB file storage (for room images)
- 2 GB bandwidth per month
- 500K Edge Function invocations

### Lovable AI Gateway:
- Charges for Gemini API usage
- Pay per API call
- Rate limits apply

**Note:** If you exceed limits, you'll need to upgrade Supabase plan or add credits to Lovable AI Gateway.

---

## Alternative Architecture Options

If you want to simplify and remove Supabase dependency:

### Option 1: Move to Express Backend
- Create Express endpoint for image upload
- Use Multer for file handling
- Store images in local filesystem or AWS S3
- Call Gemini API directly from Express
- **Pros:** Single backend, simpler architecture
- **Cons:** Need to manage image storage, AI API keys, scaling

### Option 2: Keep Hybrid (Current)
- **Pros:** Serverless AI features, automatic scaling, managed storage
- **Cons:** Two backends to maintain, additional service dependency

### Option 3: Full Supabase
- Move entire backend to Supabase (PostgreSQL + Edge Functions)
- Replace Express with Supabase Edge Functions
- Use Supabase Auth instead of JWT
- **Pros:** Fully managed, single platform
- **Cons:** Major refactor, vendor lock-in

---

## Deployment Considerations

### Express Backend
- Deploy to: Heroku, Railway, Render, AWS, DigitalOcean
- Requires: Node.js runtime, PostgreSQL database

### Supabase Edge Function
- Already deployed on Supabase platform
- Update via Supabase CLI:
  ```bash
  supabase functions deploy visualize-room
  ```

### Frontend
- Deploy to: Vercel, Netlify, Cloudflare Pages
- Set environment variables for both backends:
  - Express API URL
  - Supabase URL and keys

---

## Summary

**Supabase Purpose:** Exclusively powers the AI Room Visualizer feature

**What it does:**
1. Stores room images (Supabase Storage)
2. Runs AI analysis (Edge Function → Gemini 2.5 Flash)
3. Generates painted room visualizations (Edge Function → Gemini 2.5 Flash Image)

**What it doesn't do:**
- Authentication (Express handles this)
- Business logic (Express handles this)
- Database operations (Express + PostgreSQL handles this)

This is a **smart hybrid architecture** that leverages Supabase's strengths (serverless AI, image storage) while keeping your core business logic in Express where you have full control.
