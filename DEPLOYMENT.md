# Deployment Guide - SafeVisit

## Quick Deploy to Vercel

### 1. Prepare Supabase
1. Create project at [supabase.com](https://supabase.com)
2. Run SQL from `supabase-simple-schema.sql` in SQL Editor
3. Copy Project URL and anon key from Settings > API

### 2. Deploy to Vercel
1. Push code to GitHub (private repo)
2. Connect GitHub repo to [vercel.com](https://vercel.com)
3. Add environment variables:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Deploy

### 3. Access URLs
- Admin: `https://your-app.vercel.app/dashboard`
- Reception: `https://your-app.vercel.app/reception`
- Guest Terminal: `https://your-app.vercel.app/guest/{company_id}`
- Checkout: `https://your-app.vercel.app/checkout`

### Environment Variables
Copy `.env.example` to `.env` and fill with your Supabase credentials.

### Database Setup
Run `supabase-simple-schema.sql` in your Supabase SQL Editor to create all required tables.