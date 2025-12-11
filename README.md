# ZNO Clue Collector - Web Version

Mobile-friendly web app for searching ZNO questions!

## Files

- `index.html` - Main page
- `style.css` - Dark theme styling
- `app.js` - Search logic
- `questions_full.json` - Questions database (copy from parent folder)

## Local Testing

```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Then open http://localhost:8000
```

---

## FREE Hosting Options

### 1. GitHub Pages (Recommended - Easiest!)

1. Create new repo on GitHub
2. Upload all files from `Web/` folder to repo root
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch** → `main` → `/ (root)`
5. Save → Your site will be at `https://USERNAME.github.io/REPO-NAME`

### 2. Netlify (Drag & Drop!)

1. Go to [netlify.com](https://netlify.com)
2. Sign up (free)
3. Drag the `Web/` folder onto their dashboard
4. Done! Get a free `*.netlify.app` domain

### 3. Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import from GitHub or upload folder
3. Free `*.vercel.app` domain

### 4. Cloudflare Pages

1. Go to [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect GitHub or direct upload
3. Free `*.pages.dev` domain

### 5. GitHub Gist (Static HTML only)

GitHub Gists don't serve HTML directly, but you can use:

- [bl.ocks.org](https://bl.ocks.org) - renders gists as pages
- [GitHack](https://raw.githack.com) - CDN for raw files

---

## Quick Deploy to GitHub Pages

```bash
# In the Web folder:
git init
git add .
git commit -m "ZNO Search Web App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/zno-search.git
git push -u origin main

# Then enable Pages in repo settings!
```

---

## Custom Domain (Optional)

All services above support custom domains for free:

1. Buy domain (~$10/year from Namecheap, Porkbun, etc.)
2. Add CNAME record pointing to your hosted site
3. Configure in hosting dashboard

Enjoy! 🎉
