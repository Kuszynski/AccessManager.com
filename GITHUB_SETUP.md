# GitHub Setup Instructions

## 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit - SafeVisit VMS"
```

## 2. Create Private GitHub Repository
1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Name: `safevisit` (or your preferred name)
4. **Set to Private** ✅
5. Don't initialize with README (we have one)
6. Click "Create repository"

## 3. Connect Local to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 4. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import from GitHub (authorize if needed)
4. Select your private repository
5. Add environment variables from `.env.example`
6. Deploy

## Security Notes
- ✅ `.env` is in `.gitignore` - your Supabase keys are safe
- ✅ Repository is private - code is protected
- ✅ Vercel supports private repos - no issues with deployment

## Environment Variables for Vercel
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
```