# Deployment Guide

## Frontend on Netlify

This repo includes [netlify.toml](C:/IBRAZ/Event%20Software%20Online%20Registration/netlify.toml:1) and [client/public/_redirects](C:/IBRAZ/Event%20Software%20Online%20Registration/client/public/_redirects:1) for React Router SPA deployment.

### Netlify settings

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `dist`

### Netlify environment variable

- `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

## Backend on Render

This repo includes [render.yaml](C:/IBRAZ/Event%20Software%20Online%20Registration/render.yaml:1) for a Node web service under `server/`.

### Render environment variables

- `CLIENT_URLS=https://YOUR-NETLIFY-SITE.netlify.app`
- `PUBLIC_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com`
- `MONGODB_URI=mongodb+srv://...`
- `USE_IN_MEMORY_DB=false`

Optional later:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `MAIL_FROM`

Badge template:

- `BADGE_TEMPLATE_PATH=assets/M-badge Design.pdf`

## MongoDB Atlas

Use a MongoDB Atlas connection string from the Atlas dashboard and paste it into Render as `MONGODB_URI`.

Recommended app database name:

- `event_management`

Typical Atlas URI format:

```text
mongodb+srv://USERNAME:PASSWORD@cluster-name.xxxxx.mongodb.net/event_management?retryWrites=true&w=majority&appName=event_management
```
