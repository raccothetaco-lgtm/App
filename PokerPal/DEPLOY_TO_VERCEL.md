# Deploy Poker Pal to Vercel - Complete Guide

## Why Vercel?
- ✅ **Free** forever (for your use case)
- ✅ **5 minutes** to deploy
- ✅ **Automatic HTTPS** - yourapp.vercel.app
- ✅ **AdSense will work** - Google can verify your site
- ✅ **Custom domains** supported (optional)

---

## Step 1: Export Your Code from Figma Make

1. In Figma Make, find the **"Export"** or **"Download"** button
2. Download all your code as a ZIP file
3. **Unzip** the folder on your computer
4. You should see files like:
   - `src/` folder
   - `package.json`
   - `vercel.json` ✅ (already configured!)
   - `ads.txt` ✅ (AdSense file ready!)

---

## Step 2: Sign Up for Vercel

1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (easiest)
   - Or use email/Google/GitLab
4. Complete the free sign-up (no credit card needed!)

---

## Step 3: Deploy Your App

### Method A: Drag & Drop (Easiest - 2 minutes)

1. After logging into Vercel, click **"Add New..."** → **"Project"**
2. Click **"Browse"** or drag your unzipped folder onto the page
3. Vercel will automatically detect:
   - ✅ Framework: Vite
   - ✅ Build Command: `pnpm build`
   - ✅ Output Directory: `dist`
4. Click **"Deploy"**
5. Wait 1-2 minutes... ☕
6. Done! 🎉

### Method B: GitHub (More Professional)

1. Create a GitHub account if you don't have one
2. Create a new repository
3. Upload your code to GitHub
4. In Vercel, click **"Import Project"**
5. Select your GitHub repo
6. Click **"Deploy"**

---

## Step 4: Verify Your Deployment

After deployment completes:

1. Vercel gives you a URL like: **`poker-pal-xyz123.vercel.app`**
2. Click it to open your app
3. **Test it works:**
   - Try creating a session
   - Check if the ad space appears (may be blank until AdSense approves)
   - Make sure everything functions correctly

---

## Step 5: Verify ads.txt File

Your `ads.txt` file is already configured! Verify it's accessible:

1. Open: **`https://your-app.vercel.app/ads.txt`**
2. You should see:
   ```
   google.com, pub-3884161160129129, DIRECT, f08c47fec0942fa0
   ```
3. ✅ If you see that, perfect!

---

## Step 6: Connect to AdSense

1. Go to **https://adsense.google.com**
2. Go to **"Sites"** section
3. Click **"Add Site"**
4. Enter your Vercel URL: `your-app.vercel.app`
5. Click **"Save and Continue"**
6. Google will verify:
   - ✅ The meta tag in your `<head>`
   - ✅ The `ads.txt` file
   - ✅ Your site is accessible

**Verification time:** Usually 1-2 days (sometimes instant!)

---

## Step 7: Update Supabase (Important!)

Your app uses Supabase for the backend. You need to allow your new Vercel URL:

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Find **"Site URL"** or **"Allowed Origins"**
4. Add your Vercel URL: `https://your-app.vercel.app`
5. Save changes

Without this, your sessions won't sync!

---

## Step 8: Wait for AdSense Approval

After Google verifies your site:

1. **Check AdSense dashboard** for approval status
2. Usually takes **1-2 days**
3. Once approved, ads will start showing automatically!
4. You'll start earning money from ad impressions 💰

---

## Optional: Add a Custom Domain

Want `pokerpal.com` instead of `poker-pal-xyz123.vercel.app`?

1. Buy a domain (Google Domains, Namecheap, etc.) - ~$10/year
2. In Vercel project settings, go to **"Domains"**
3. Click **"Add"**
4. Enter your domain
5. Follow the DNS configuration instructions
6. Done! Your app is now at your custom domain

---

## Troubleshooting

### "Build Failed"
- Make sure all files were uploaded
- Check the build logs in Vercel
- The `vercel.json` file should be in the root folder

### "Site Not Working"
- Check the deployment logs
- Make sure Supabase URL is added to allowed origins
- Try redeploying

### "Ads Not Showing"
- AdSense needs 1-2 days to verify and approve
- Check `your-app.vercel.app/ads.txt` is accessible
- Verify the meta tag is in the page source (right-click → View Source)
- Make sure ad blocker is disabled when testing

### "Sessions Not Syncing"
- Add Vercel URL to Supabase allowed origins
- Redeploy Supabase edge function if needed
- Check browser console for CORS errors

---

## What You Get

✅ **Live website** at `your-app.vercel.app`
✅ **Automatic HTTPS** (secure)
✅ **AdSense verified** and ready to earn
✅ **Fast performance** on Vercel's global CDN
✅ **Free hosting** forever (for your use case)
✅ **Automatic deployments** (if using GitHub)

---

## Costs

- **Vercel:** FREE (forever for this app)
- **Domain (optional):** ~$10-15/year
- **Supabase:** FREE tier is enough
- **AdSense:** FREE (you earn money!)

Total: **$0** (or $10/year if you want a custom domain)

---

## Next Steps After Deployment

1. ✅ Share your app URL with friends
2. ✅ Wait for AdSense approval (1-2 days)
3. ✅ Start earning revenue from ads
4. ✅ Monitor AdSense dashboard for earnings
5. ✅ (Optional) Add custom domain
6. ✅ (Optional) Submit to app directories

---

## Support

**Vercel Help:**
- Documentation: https://vercel.com/docs
- Support: https://vercel.com/support

**AdSense Help:**
- Dashboard: https://adsense.google.com
- Help Center: https://support.google.com/adsense

**Your App is Ready to Deploy!** 🚀

Just follow the steps above and you'll be live in 5 minutes!
