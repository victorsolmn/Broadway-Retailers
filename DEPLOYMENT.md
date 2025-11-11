# Broadway Retailers - Deployment Guide

## Environment Variables

This project requires the following environment variables:

### Required Variables

1. **NEXTAUTH_SECRET** - Secret key for NextAuth.js authentication
   - Generate: `openssl rand -base64 32`
   - Example: `LlzCNycp8JD34HPbDNxDgrX5emsflLo8UNhcx3tgRRI=`

2. **NEXTAUTH_URL** - Base URL of your application
   - Local: `http://localhost:3000`
   - Production: `https://your-site.netlify.app`

3. **DATABASE_URL** - Database connection string
   - SQLite (demo): `file:./dev.db`
   - PostgreSQL (production): `postgresql://user:password@host:5432/database`

## Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the values in `.env.local`

3. Run the development server:
   ```bash
   npm run dev
   ```

## Netlify Deployment

### Via Netlify CLI

```bash
# 1. Login to Netlify
netlify login

# 2. Link to your site
netlify link

# 3. Set environment variables
netlify env:set NEXTAUTH_SECRET "$(openssl rand -base64 32)"
netlify env:set NEXTAUTH_URL "https://your-site.netlify.app"
netlify env:set DATABASE_URL "file:./dev.db"

# 4. Deploy
netlify deploy --prod
```

### Via Netlify Dashboard

1. Go to Site Settings → Environment Variables
2. Add the three variables listed above
3. Trigger a new deployment

## Current Deployment

- **URL**: https://broadway-retailers.netlify.app
- **Status**: Active
- **Platform**: Netlify with Next.js 16

## Notes

- The current deployment uses SQLite (`file:./dev.db`) which is suitable for prototypes
- For production, migrate to a cloud database (Supabase, PlanetScale, or Neon)
- Environment variables are not committed to Git for security
