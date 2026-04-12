# Poker Pal - Vercel Deployment Checklist ✅

## Quick 5-Minute Deployment

### Before You Start
- [ ] Your code is ready in Figma Make
- [ ] You have a Gmail or GitHub account

---

## Step-by-Step Checklist

### 1. Export Code (1 min)
- [ ] Download your code from Figma Make as ZIP
- [ ] Unzip the folder on your computer
- [ ] Verify you see `package.json`, `src/` folder, `vercel.json`

### 2. Sign Up for Vercel (1 min)
- [ ] Go to https://vercel.com
- [ ] Click "Sign Up"
- [ ] Choose "Continue with GitHub" or your preferred method
- [ ] Complete free registration

### 3. Deploy (2 min)
- [ ] In Vercel, click "Add New..." → "Project"
- [ ] Drag your unzipped folder onto the page
- [ ] Verify settings:
  - Framework: Vite ✅
  - Build Command: `pnpm build` ✅
  - Output Directory: `dist` ✅
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (~1 min)

### 4. Test Your Deployment (1 min)
- [ ] Open the Vercel URL (e.g., `poker-pal-xyz.vercel.app`)
- [ ] Test creating a session
- [ ] Verify the app works
- [ ] Check `your-url.vercel.app/ads.txt` shows your AdSense info

### 5. Configure Supabase (Important!)
- [ ] Go to your Supabase project dashboard
- [ ] Settings → API → Add your Vercel URL to allowed origins
- [ ] Redeploy edge function if needed
- [ ] Test session syncing works

### 6. Connect to AdSense (Final Step)
- [ ] Go to https://adsense.google.com
- [ ] Sites → "Add Site"
- [ ] Enter your Vercel URL
- [ ] Wait 1-2 days for verification
- [ ] Check approval status in AdSense dashboard

---

## Verification Checklist

After deployment, verify these URLs work:

- [ ] **App URL:** `https://your-app.vercel.app` - App loads
- [ ] **ads.txt:** `https://your-app.vercel.app/ads.txt` - Shows AdSense info
- [ ] **Meta tag:** View source, see `<meta name="google-adsense-account">`
- [ ] **Create session:** Ad space appears (may be blank until approved)
- [ ] **Join session:** Multi-device sync works
- [ ] **Supabase:** Sessions sync across devices

---

## Expected Timeline

| Step | Time |
|------|------|
| Export & Upload | 2 min |
| Vercel Deploy | 1-2 min |
| Testing | 1 min |
| AdSense Verification | 1-2 days |
| **Total to Live** | **~5 minutes** |
| **Total to Earning** | **1-2 days** |

---

## After Approval

Once AdSense approves (1-2 days):

- ✅ Ads will automatically start showing
- ✅ You'll see real ads in the ad space
- ✅ Check AdSense dashboard for earnings
- ✅ Payment threshold is $100

---

## Troubleshooting

**Deployment failed?**
→ Make sure `vercel.json` is in the root folder

**Ads not showing?**
→ Wait 1-2 days for AdSense approval

**Sessions not syncing?**
→ Add Vercel URL to Supabase allowed origins

**Build errors?**
→ Check Vercel deployment logs

---

## You're Ready! 🚀

Follow this checklist and your Poker Pal app will be live in 5 minutes!

See `DEPLOY_TO_VERCEL.md` for detailed instructions.
