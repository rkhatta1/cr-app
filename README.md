# [⚡ CLASHROAST FRONTEND](https://clashroast.vercel.app/)

> **AI roasts for your replays.** Upload your Clash Royale gameplay, get absolutely flamed by iconic character voices, smart zooms, and viral captions. Built for gamers, by gamers.

## 🎮 What Is This?

ClashRoast is the frontend powerhouse that turns boring Clash Royale replays into viral 9:16 TikTok-ready content. We handle the upload flow, user auth, real-time processing updates, and serve an aggressive brutalist landing page that doesn't mess around.

**Live Beta:** Because your mid-ladder gameplay deserves to be roasted properly.

---

## 🛠️ Tech Stack

- **Next.js 16.1.1** (App Router) - React framework with file-based routing
- **TypeScript** - Type safety for the entire codebase
- **Tailwind CSS** - Utility-first styling (custom brutalist theme)
- **BetterAuth** - Headless auth with Google OAuth
- **React Query (TanStack Query)** - Server state management
- **Prisma** - Database ORM for PostgreSQL
- **Google Cloud Storage** - Resumable video uploads with XHR progress tracking

---

## 🏗️ Architecture Overview

### **App Router Structure**

```
app/
├── page.tsx                  # Landing page (brutalist hero, before/after videos)
├── login/                    # Auth flow (Google OAuth via BetterAuth)
├── dashboard/                # User's video library (with generation limits)
├── upload/                   # Multi-step upload wizard (video + character selection)
├── videos/[id]/              # Video detail page (real-time processing status)
├── api/                      # Next.js API routes (proxy to Flask backend)
│   ├── auth/[...all]/        # BetterAuth handler
│   ├── videos/               # Video CRUD operations
│   ├── upload/               # GCS resumable upload session init
│   └── characters/           # Character voice options
└── layout.tsx                # Root layout (Inter + JetBrains Mono fonts)
```

### **Key Components**

- **`UploadContext`** - Global upload state manager (tracks XHR progress for multiple videos)
- **`Sidebar`** - Persistent navigation with generation count display
- **`VideoCard`** - Displays video status (uploading/processing/completed/failed) with inline actions
- **`ProcessingSteps`** - Visual pipeline for video processing stages

---

## 🔄 Data Flow

### **1. Authentication Flow**

```
User clicks "Sign In"
  → BetterAuth Google OAuth
  → Session stored in PostgreSQL
  → User record contains generationsCount (max 2 free videos)
  → Frontend reads session via authClient.useSession()
```

### **2. Upload Flow**

```
User uploads video on /upload
  → POST /api/upload (creates GCS resumable session)
  → XHR upload with progress tracking (stored in UploadContext)
  → POST /api/videos (creates video record in backend)
  → Atomic generationsCount increment (with rollback on failure)
  → Backend triggers Cloud Run Job for processing
  → Frontend polls video status via React Query
```

### **3. Processing Pipeline (Backend-Driven)**

```
Video Status Lifecycle:
  uploading → pending → processing → completed/failed

Frontend listens via:
  - React Query auto-refetch (5s interval on video detail page)
  - ProcessingSteps component visualizes: Upload → Analysis → Voice → Final Cut
```

### **4. User Authorization**

```
All backend requests include:
  - user_id from BetterAuth session
  - Backend verifies ownership on GET/DELETE/download
  - PostgreSQL video.user_id foreign key ensures data isolation
```

### **5. Generation Limit System**

```
User.generationsCount tracked in Prisma:
  - Incremented atomically on video submission (with lt: 2 check)
  - Refunded only on failed videos (via refundedVideo tracking table)
  - UI disables "New Project" when limit reached
  - Upload page redirects to dashboard if limit exceeded
```

---

## 📂 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
├── components/
│   ├── layout/              # Sidebar, navigation
│   ├── ui/                  # Button, Card, Loading components
│   └── upload/              # Upload wizard steps
├── contexts/
│   └── UploadContext.tsx    # Global upload progress state
├── lib/
│   ├── auth-client.ts       # BetterAuth client configuration
│   └── auth.ts              # BetterAuth server configuration
├── prisma/
│   └── schema.prisma        # Database schema (User, RefundedVideo)
```

---

**Built with ⚡ by gamers who know your e-barb bridge spam is trash.**
