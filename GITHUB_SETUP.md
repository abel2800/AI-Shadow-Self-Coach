# GitHub Repository Setup Guide
## Pushing AI Shadow-Self Coach to GitHub

This guide will help you push the project to GitHub safely, ensuring sensitive files are not committed.

---

## 📝 Repository Name Suggestion

**Recommended Repository Name:**
```
ai-shadow-self-coach
```

**Alternative Names:**
- `shadow-coach-app`
- `ai-shadow-coach`
- `shadow-self-coach-mobile`
- `gentle-deep-coach`

**Why `ai-shadow-self-coach`:**
- Descriptive and clear
- Matches project name
- SEO-friendly
- Professional naming

---

## ✅ Pre-Push Checklist

### 1. Verify .gitignore is Complete

The `.gitignore` file should exclude:
- ✅ `.env` files (all variations)
- ✅ `node_modules/`
- ✅ `logs/`
- ✅ Database files
- ✅ ML model files
- ✅ Secrets and keys
- ✅ Build outputs

### 2. Check for Sensitive Files

**Before pushing, verify these are NOT in the repo:**
- ❌ `backend/.env`
- ❌ `mobile/.env`
- ❌ `ml/.env`
- ❌ Any files with passwords
- ❌ API keys
- ❌ Database credentials
- ❌ Private keys (`.pem`, `.key`)

**These SHOULD be in the repo:**
- ✅ `.env.example` files (templates)
- ✅ All source code
- ✅ Documentation
- ✅ Configuration templates

---

## 🚀 Step-by-Step Push Instructions

### Step 1: Create GitHub Repository

1. Go to GitHub.com
2. Click "+" → "New repository"
3. **Repository name:** `ai-shadow-self-coach`
4. **Description:** "AI Shadow-Self Coach — Mobile-first AI-powered personal coach for shadow work and self-exploration"
5. **Visibility:** Choose Private (recommended) or Public
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

### Step 2: Initialize Git (if not already done)

```bash
# Navigate to project root
cd E:\ai

# Check if git is initialized
git status

# If not initialized, run:
git init
```

### Step 3: Verify .gitignore

```bash
# Check what will be ignored
git status --ignored

# Verify .env files are ignored
git check-ignore backend/.env
git check-ignore mobile/.env
```

### Step 4: Add Files to Git

```bash
# Add all files (respecting .gitignore)
git add .

# Check what will be committed (verify no .env files)
git status

# You should NOT see:
# - backend/.env
# - mobile/.env
# - Any sensitive files
```

### Step 5: Create Initial Commit

```bash
# Create commit
git commit -m "Initial commit: AI Shadow-Self Coach project

- Complete backend API with all features
- Full mobile app structure
- Comprehensive documentation
- Docker and CI/CD infrastructure
- ML training scripts
- Project status: 95% complete"
```

### Step 6: Add Remote Repository

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/ai-shadow-self-coach.git

# Or if using SSH:
# git remote add origin git@github.com:YOUR_USERNAME/ai-shadow-self-coach.git

# Verify remote
git remote -v
```

### Step 7: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main

# If you get authentication error, you may need to:
# - Use GitHub CLI: gh auth login
# - Or use personal access token
# - Or set up SSH keys
```

---

## 🔒 Security Verification

### After Pushing, Verify on GitHub

1. Go to your repository on GitHub
2. Check that these files are **NOT** visible:
   - ❌ `backend/.env`
   - ❌ `mobile/.env`
   - ❌ Any files with passwords or keys

3. Check that these files **ARE** visible:
   - ✅ `backend/.env.example`
   - ✅ All source code
   - ✅ Documentation
   - ✅ `.gitignore` file

### If You Accidentally Pushed Sensitive Files

**If you see `.env` files in GitHub:**

1. **Immediately remove them:**
   ```bash
   # Remove from git (but keep local file)
   git rm --cached backend/.env
   git rm --cached mobile/.env
   
   # Commit the removal
   git commit -m "Remove sensitive .env files"
   
   # Push the fix
   git push
   ```

2. **Rotate all secrets:**
   - Change database password
   - Regenerate API keys
   - Update JWT secret
   - Change any exposed credentials

3. **Update .gitignore** to prevent future commits

---

## 📋 Files That Should Be Pushed

### ✅ Safe to Push

**Code:**
- All `.js`, `.jsx`, `.ts`, `.tsx` files
- All `.py` files
- Configuration files (`.json`, `.yaml`, `.yml`)
- Docker files (`Dockerfile`, `docker-compose.yml`)
- CI/CD files (`.github/workflows/`)

**Documentation:**
- All `.md` files
- `README.md`
- `SPECIFICATION.md`
- `API_CONTRACTS.md`
- All guides

**Templates:**
- `.env.example` files
- Configuration templates
- Example files

**Project Files:**
- `package.json`
- `requirements.txt`
- `.gitignore`
- `.dockerignore`
- License files

### ❌ Never Push

**Sensitive:**
- `.env` files
- Files with passwords
- API keys
- Private keys (`.pem`, `.key`)
- Database dumps
- Secrets files

**Generated:**
- `node_modules/`
- `dist/`, `build/`
- `*.log` files
- Coverage reports
- Compiled files

---

## 🛡️ Additional Security Tips

### 1. Use Environment Variables

Always use `.env.example` as a template:
```bash
# Copy example to create .env locally
cp backend/.env.example backend/.env
# Then edit .env with your actual values (never commit)
```

### 2. Use GitHub Secrets (for CI/CD)

For GitHub Actions, use repository secrets:
- Settings → Secrets and variables → Actions
- Add secrets there, not in code

### 3. Review Before Pushing

```bash
# Always check what you're about to commit
git status

# Review changes
git diff

# Check for sensitive data
git diff | grep -i "password\|secret\|key\|token"
```

### 4. Use .gitignore Patterns

The `.gitignore` should include:
```
.env
.env.*
!*.env.example
**/.env
**/.env.*
```

---

## 📝 Quick Reference Commands

```bash
# Check repository status
git status

# See what will be committed
git status --short

# Check if file is ignored
git check-ignore path/to/file

# Add all files (respecting .gitignore)
git add .

# Create commit
git commit -m "Your commit message"

# Push to GitHub
git push origin main

# If you need to remove a file from git (but keep locally)
git rm --cached path/to/file
```

---

## ✅ Final Checklist

Before pushing:
- [ ] Repository created on GitHub
- [ ] `.gitignore` verified
- [ ] No `.env` files in staging
- [ ] No sensitive data in code
- [ ] All documentation included
- [ ] Initial commit message ready
- [ ] Remote repository added
- [ ] Ready to push

After pushing:
- [ ] Verified no `.env` files on GitHub
- [ ] All code pushed successfully
- [ ] Documentation visible
- [ ] Repository is private (if needed)
- [ ] Team has access (if applicable)

---

## 🎯 Next Steps After Push

1. **Set Repository Description** - Add project description
2. **Add Topics/Tags** - Add relevant tags (ai, mobile, therapy, etc.)
3. **Create README Badge** - Add status badges
4. **Set Up Branch Protection** - Protect main branch
5. **Configure Secrets** - Set up GitHub Secrets for CI/CD
6. **Add Collaborators** - Invite team members
7. **Set Up Webhooks** - For deployment (if needed)

---

## 🆘 Troubleshooting

### Authentication Issues

**If you get "Authentication failed":**
```bash
# Use GitHub CLI
gh auth login

# Or use personal access token
# Settings → Developer settings → Personal access tokens
```

### Large Files

**If files are too large:**
```bash
# Check file sizes
git ls-files | xargs ls -lh | sort -k5 -h

# Use Git LFS for large files
git lfs install
git lfs track "*.pdf"
git lfs track "*.zip"
```

### Merge Conflicts

**If you have conflicts:**
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts
# Then commit and push
```

---

**Your repository is ready to push!** 🚀

**Repository Name:** `ai-shadow-self-coach`  
**Next:** Create repo on GitHub, then follow push instructions above.

