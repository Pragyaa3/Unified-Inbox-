# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Twilio account with phone number
- (Optional) Vercel account for easy deployment

---

## Option 1: Deploy to Vercel (Recommended)

### 1. Prepare your repository
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Set up database

Use a PostgreSQL provider:
- **Vercel Postgres** (recommended)
- **Supabase**
- **Neon**
- **Railway**

Get your `DATABASE_URL` connection string.

### 3. Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 4. Configure environment variables

In Vercel dashboard, add:
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=ACxxx...
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
CRON_SECRET=your-cron-secret
```

### 5. Set up database
```bash
# Push schema
npx prisma db push

# Seed database
npx prisma db seed
```

### 6. Configure Twilio webhook

In Twilio Console, set webhook URL to:
```
https://your-app.vercel.app/api/webhooks/twilio
```

---

## Option 2: Deploy to Railway

### 1. Create Railway account

Go to [railway.app](https://railway.app) and sign up.

### 2. Create new project
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Add PostgreSQL
railway add postgresql
```

### 3. Deploy
```bash
railway up
```

### 4. Set environment variables
```bash
railway variables set JWT_SECRET=your-secret
railway variables set TWILIO_ACCOUNT_SID=ACxxx...
railway variables set TWILIO_AUTH_TOKEN=your-token
railway variables set TWILIO_PHONE_NUMBER=+1234567890
```

---

## Option 3: Docker Deployment

### 1. Build Docker image
```bash
docker build -t unified-inbox .
```

### 2. Run with Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Environment variables

Create `.env.production`:
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
# ... other variables
```

---

## Post-Deployment Checklist

- [ ] Database schema pushed
- [ ] Database seeded with initial data
- [ ] Environment variables configured
- [ ] Twilio webhook configured
- [ ] SSL certificate active (HTTPS)
- [ ] Cron job configured for scheduled messages
- [ ] Error tracking configured (optional: Sentry)
- [ ] Monitoring configured (optional: LogRocket)
- [ ] Backup strategy in place
- [ ] Test sending/receiving messages
- [ ] Verify analytics are tracking

---

## Monitoring

### Logs

**Vercel:**
```bash
vercel logs
```

**Railway:**
```bash
railway logs
```

### Health Check

Create `/api/health` endpoint:
```typescript
export async function GET() {
  return Response.json({ status: 'ok', timestamp: new Date() })
}
```

---

## Troubleshooting

### Database connection errors

1. Check `DATABASE_URL` format
2. Verify database is accessible
3. Check connection pool settings

### Twilio webhook not working

1. Verify webhook URL in Twilio Console
2. Check HTTPS is enabled
3. Review webhook logs in Twilio Console
4. Test with ngrok locally first

### Messages not sending

1. Verify Twilio credentials
2. Check Twilio account balance
3. Review integration logs
4. Test with Twilio Console

---

## Scaling

### Database

- Enable connection pooling
- Add read replicas
- Implement caching (Redis)

### Application

- Enable Vercel Edge Functions
- Use CDN for static assets
- Implement rate limiting

### Background Jobs

- Use dedicated job queue (Bull, BullMQ)
- Separate worker processes
- Implement retry logic