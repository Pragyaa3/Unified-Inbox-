# Unified Inbox - Multi-Channel Communication Platform

A Next.js application for managing SMS, WhatsApp, Email, and social media messages in one unified inbox.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Twilio account (for SMS/WhatsApp)

### Setup Steps

1. **Clone and Install**
```bash
git clone <your-repo>
cd unified-inbox
npm install
```

2. **Set up Database**
```bash
# Create PostgreSQL database
createdb unified_inbox

# Or use Docker
docker run --name unified-inbox-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=unified_inbox \
  -p 5432:5432 \
  -d postgres:15
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `TWILIO_ACCOUNT_SID` - From Twilio Console
- `TWILIO_AUTH_TOKEN` - From Twilio Console  
- `TWILIO_PHONE_NUMBER` - Your Twilio number

4. **Initialize Database**
```bash
# Push schema to database
npm run db:push

# Seed with demo data
npm run db:seed
```

5. **Start Development Server**
```bash
npm run dev
```

Open http://localhost:3000

### Demo Login
- Email: `demo@unified-inbox.local`
- Password: `demo123`

```
unified-inbox/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── api/         # API routes
│   │   ├── dashboard/   # Dashboard page
│   │   └── page.tsx     # Home page
│   ├── components/       # React components
│   ├── lib/             # Utilities
│   │   ├── db.ts       # Prisma client
│   │   └── integrations/ # Channel integrations
│   └── config/          # Configuration
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Seed data
└── package.json
```

## 🔧 Twilio Webhook Setup

1. Go to Twilio Console → Phone Numbers
2. Select your number
3. Under "Messaging", set webhook URL to:
```
   https://your-domain.com/api/webhooks/twilio
```
4. Set HTTP Method to `POST`

For local testing, use ngrok:
```bash
ngrok http 3000
# Use the ngrok URL in Twilio webhook settings
```

## 📊 Features

- ✅ SMS & WhatsApp messaging via Twilio
- ✅ Unified inbox with thread view
- ✅ Contact management
- ✅ Message scheduling
- ✅ Team collaboration with notes
- ✅ Analytics dashboard
- ✅ Real-time webhook processing

## 🛠️ Development
```bash
# Run development server
npm run dev

# Open Prisma Studio (database GUI)
npm run db:studio

# Run linter
npm run lint

# Build for production
npm run build
```

## 📝 Environment Variables

See `.env.example` for all available options.

## 🐛 Troubleshooting

**Database connection errors:**
- Check `DATABASE_URL` format
- Ensure PostgreSQL is running
- Try: `npx prisma db push --force-reset`

**Twilio webhook not working:**
- Use ngrok for local testing
- Check webhook URL in Twilio Console
- Review logs in terminal

**Messages not sending:**
- Verify Twilio credentials in `.env`
- Check Twilio account balance
- Review integration logs

## 📚 Documentation

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Twilio API Docs](https://www.twilio.com/docs/sms)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request


