# Corpus — M&A Agreement Training Platform

## Deploy to Vercel (no command line needed)

### Step 1: Upload to GitHub
1. Go to github.com → New repository → name it `corpus`
2. Upload all these files via GitHub's web interface (drag and drop)

### Step 2: Deploy on Vercel
1. Go to vercel.com → Add New Project → Import from GitHub
2. Select the `corpus` repo → Framework: Next.js → Deploy
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):

```
NEXT_PUBLIC_SUPABASE_URL=      # from supabase.com project settings
NEXT_PUBLIC_SUPABASE_ANON_KEY= # from supabase.com project settings  
SUPABASE_SERVICE_ROLE_KEY=     # from supabase.com project settings
ADMIN_PASSWORD=                # anything you want
ANTHROPIC_API_KEY=             # from console.anthropic.com
```

### Step 3: Set up Supabase (for admin editing)
1. Go to supabase.com → New project
2. Go to SQL Editor → paste contents of `supabase/schema.sql` → Run
3. Go to Project Settings → API → copy the URL and keys into Vercel env vars
4. Redeploy on Vercel

### Step 4: Access admin
- Go to `your-site.vercel.app/admin`
- Enter your ADMIN_PASSWORD
- Edit content, use AI drafting assistant, save to Supabase

## How it works
- Public site reads from Supabase (if configured) or falls back to static data files
- Admin panel at `/admin/edit` lets you edit all content with AI assistance
- AI drafting calls Claude with full context about the provision and level
- Saves go to Supabase and are immediately live on the public site
