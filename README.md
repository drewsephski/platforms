# Platforms

A production-ready multi-tenant application built with Next.js 15, featuring path-based routing for each site. Transform prompts into production-ready websites instantly.

## Features

- ✅ Path-based site routing with Next.js middleware
- ✅ Site-specific content and pages
- ✅ Shared components and layouts across sites
- ✅ Supabase for data storage
- ✅ Admin interface for managing sites
- ✅ Emoji support for site branding
- ✅ AI-powered site generation
- ✅ Compatible with Vercel preview deployments

## Tech Stack

- [Next.js 15](https://nextjs.org/) with App Router
- [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) for database and auth
- [Upstash Redis](https://upstash.com/) for caching
- [Tailwind 4](https://tailwindcss.com/) for styling
- [shadcn/ui](https://ui.shadcn.com/) for the design system

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- pnpm (recommended) or npm/yarn
- Supabase account (for database and auth)
- Upstash Redis account (for caching)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/vercel/platforms.git
   cd platforms
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   KV_REST_API_URL=your_redis_url
   KV_REST_API_TOKEN=your_redis_token
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Access the application:
   - Main site: <http://localhost:3000>
   - Admin panel: <http://localhost:3000/admin>
   - Sites: <http://localhost:3000/s/[site-name]>

## Architecture

This application demonstrates a path-based multi-tenant architecture where:

- Each site gets its own path (`/s/[site-name]`)
- The middleware handles routing requests to the correct site
- Site data is stored in Supabase with caching in Redis
- The main domain hosts the landing page and admin interface
- Sites are dynamically mapped to site-specific content

The middleware (`middleware.ts`) handles routing across various environments (local development, production, and Vercel preview deployments).

## Deployment

This application is designed to be deployed on Vercel. To deploy:

1. Push your repository to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy

No special DNS configuration is required for path-based routing.
