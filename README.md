# My Wishlist

A wishlist app built with Next.js where you can create wishlists, share them with friends via public links, and let others reserve items. Includes referral link injection and real-time reservation updates via SSE.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL via [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/) (Google OAuth)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State**: [TanStack Query](https://tanstack.com/query)
- **Linter/Formatter**: [Biome](https://biomejs.dev/)

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL database (local or hosted, e.g. Supabase / Neon)

### Setup

1. Clone the repository and install dependencies:

```sh
npm install
```

2. Copy the example environment file and fill in your values:

```sh
cp .env.example .env
```

3. Run database migrations:

```sh
npx prisma migrate dev
```

4. Start the development server:

```sh
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --------------- | --------------------------------- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint source files with Biome |
| `npm run format` | Format source files with Biome |
| `npm run check` | Run Biome check on the project |

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    api/            # REST API endpoints
    dashboard/      # Authenticated dashboard
    share/          # Public wishlist view
    wishlists/      # Wishlist management
  components/       # Reusable UI components
  hooks/            # Custom React hooks
  lib/              # Shared utilities (auth, prisma, api client)
  types/            # TypeScript type augmentations
prisma/
  schema.prisma     # Database schema
```

## Environment Variables

See [`.env.example`](.env.example) for all required variables:

- `DATABASE_URL` / `DIRECT_DATABASE_URL` – PostgreSQL connection strings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` – Google OAuth credentials
- `NEXTAUTH_URL` / `NEXTAUTH_SECRET` – NextAuth configuration
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – Client-side Google ID
- `REF_CODE` – Referral code appended to item URLs
