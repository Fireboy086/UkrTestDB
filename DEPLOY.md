# Deploy to GitHub Pages - Complete Guide

## Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **"+"** in top-right → **"New repository"**
3. Name it: `zno-search` (or any name you want)
4. Make it **Public**
5. **Don't** add README, .gitignore, or license
6. Click **"Create repository"**

---

## Step 2: Prepare Your Files

Open Git Bash in the Web folder:

```bash
cd "C:\Users\User\OneDrive\Documents\Coding\Stuff\UkrainianTest\Web"
```

---

## Step 3: Initialize Git and Push

Run these commands one by one:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ZNO Clue Collector"

# Rename branch to main
git branch -M main

# Add your GitHub repo (REPLACE USERNAME!)
git remote add origin https://github.com/YOUR_USERNAME/zno-search.git

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME`** with your actual GitHub username!

---

## Step 4: Enable GitHub Pages

1. Go to your repo on GitHub: `https://github.com/YOUR_USERNAME/zno-search`
2. Click **Settings** (top menu)
3. Click **Pages** (left sidebar)
4. Under **"Source"**:
   - Branch: **main**
   - Folder: **/ (root)**
5. Click **Save**

---

## Step 5: Wait & Access

1. Wait 1-2 minutes for deployment
2. GitHub will show: **"Your site is live at..."**
3. Your URL will be: `https://YOUR_USERNAME.github.io/zno-search/`

---

## 🎉 Done!

Visit your live site: `https://YOUR_USERNAME.github.io/zno-search/`

---

## Troubleshooting

### "Failed to load questions.json"
- Make sure `questions_full.json` is in the Web folder
- Check browser console (F12) for errors

### Page shows 404
- Wait a few more minutes
- Check Settings → Pages shows green "Your site is published"
- Try hard refresh: Ctrl + Shift + R

### Changes not updating
```bash
# Make your changes, then:
git add .
git commit -m "Update site"
git push
# Wait 1-2 min for GitHub to rebuild
```

---

## Custom Domain (Optional)

1. Buy domain from Namecheap/Porkbun (~$10/year)
2. Add CNAME record pointing to: `YOUR_USERNAME.github.io`
3. In GitHub Settings → Pages → Custom domain, enter your domain
4. Enable **"Enforce HTTPS"**

Done! 🚀

