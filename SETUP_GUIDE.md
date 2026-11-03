# Matodzi Portfolio — Deployment and Like Notifications

## What is included
- React/Vite portfolio with Workspace photo gallery, GitHub and LinkedIn links.
- Like button with shared count, stored in Supabase through a Netlify Function.
- Optional email notifications through Resend after a successful new like.
- Basic repeat protection: browser localStorage and a hashed visitor IP per UTC day. This is not a full anti-abuse system.

## Install and test
Run `npm install` then `npm run build` inside this folder. To preview with serverless functions, install Netlify CLI (`npm install -g netlify-cli`) and run `netlify dev`. Plain Vite dev mode will not serve `/.netlify/functions/likes`.

## Deploy to Netlify
Push the **Matodzi_Portfolio_V4** folder as the repository root (recommended). Set Base directory blank, Build command `npm run build`, Publish directory `dist`. Alternatively, if the GitHub repository contains this as a nested folder, set Base directory to `Matodzi_Portfolio_V4` and Publish directory `dist`. Do not commit node_modules.

## Activate likes
1. Create a Supabase project and run `supabase-setup.sql` in SQL Editor.
2. In Netlify, add environment variables `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `LIKE_HASH_SECRET` (random 32+ characters). Set their scope to Functions. Keep secrets server-side only.
3. Redeploy. Like counts will now be shared between visitors.
4. To receive emails, create a Resend account, verify a sender domain, then add `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (verified sender), and `NOTIFICATION_EMAIL` in Netlify. Redeploy.
5. Test a like on the live website and confirm it appears in Supabase and your email inbox.

**Note:** Email notifications are optional; they will not send until configured. If email sending fails, the like can still be recorded. IP hashes reset daily; users on shared networks may share a daily limit. The feature is designed for a personal portfolio, not security-grade voting.
