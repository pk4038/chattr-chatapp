# Chattr

A real-time 1:1 chat application built with Next.js, TypeScript, Convex, Clerk, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Auth | Clerk |
| Backend / DB | Convex |
| Styling | Tailwind CSS |
| Deployment | Vercel |

## Architecture

```
chattr/
├── app/
│   ├── (auth)/          # Clerk auth routes (sign-in, sign-up)
│   ├── (root)/          # Protected app routes
│   │   └── chat/        # Chat UI
│   └── layout.tsx
├── components/
│   ├── ui/              # Reusable UI components
│   └── chat/            # Chat-specific components
├── convex/
│   ├── schema.ts        # Database schema
│   ├── messages.ts      # Message queries & mutations
│   └── users.ts         # User queries & mutations
└── lib/
    └── utils.ts
```

## How It Works

- **Auth** — Clerk handles sign-up, sign-in, and session management. User identity is synced to Convex on login.
- **Real-time messaging** — Convex provides a reactive database. Messages are stored and pushed to all subscribed clients instantly without polling.
- **1:1 chats** — Each conversation is scoped to two users via a shared conversation ID stored in Convex.
- **UI** — Next.js App Router with server and client components. Tailwind for styling.

## Getting Started

```bash
git clone https://github.com/your-username/chattr.git
cd chattr
npm install
```

Set up your `.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

```bash
npm run dev
```

## Live Demo

[chattr.vercel.app](https://chattr.vercel.app)
