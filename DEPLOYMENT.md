# 🚀 EndorseNYC Deployment Guide

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Railway       │    │   Neon          │
│   (Frontend)    │◄──►│   (Workers)     │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ • Next.js App   │    │ • RSS Workers   │    │ • PostgreSQL    │
│ • API Routes    │    │ • Redis Queue   │    │ • Real-time     │
│ • Static Assets │    │ • Background    │    │ • Scalable      │
└─────────────────┘    │   Jobs          │    └─────────────────┘
                       └─────────────────┘
```

## 🛠️ Setup Instructions

### 1. Database Setup (Neon)

1. **Create Neon Database**
   ```bash
   # Go to https://neon.tech
   # Create new project
   # Copy connection string
   ```

2. **Run Database Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Populate Initial Data**
   ```bash
   npm run populate:db
   ```

### 2. Redis Setup (Railway)

1. **Create Railway Project**
   ```bash
   # Go to https://railway.app
   # Create new project
   # Add Redis service
   ```

2. **Get Redis URL**
   ```bash
   # Copy Redis connection string from Railway dashboard
   ```

### 3. Environment Variables

Create `.env.local` for local development:

```env
# Database
POSTGRES_URL=your_neon_database_url_here

# Redis
REDIS_URL=your_railway_redis_url_here

# Vercel
VERCEL_URL=your_vercel_url_here

# Environment
NODE_ENV=production
```

### 4. Deploy Frontend (Vercel)

1. **Connect GitHub Repository**
   ```bash
   # Go to https://vercel.com
   # Import your GitHub repo
   ```

2. **Configure Environment Variables**
   - Add all environment variables in Vercel dashboard
   - Set `NODE_ENV=production`

3. **Deploy**
   ```bash
   # Vercel will auto-deploy on push to main
   git push origin main
   ```

### 5. Deploy Background Workers (Railway)

1. **Deploy Worker Service**
   ```bash
   # In Railway dashboard, add new service
   # Connect to your GitHub repo
   # Set start command: npm run worker
   ```

2. **Configure Environment Variables**
   - Add all environment variables in Railway
   - Set `NODE_ENV=production`

3. **Deploy**
   ```bash
   # Railway will auto-deploy on push to main
   git push origin main
   ```

## 🔧 Configuration

### RSS Feed Sources

The system automatically generates RSS feeds for:
- **High-influence endorsers** (70+ influence score)
- **News sources** covering NYC politics
- **Union and organization** feeds
- **Political party** feeds

### Background Job Schedule

- **High-priority feeds**: Every 5 minutes
- **All feeds**: Every 15 minutes
- **Daily cleanup**: 2 AM daily
- **Health checks**: Every minute

### Monitoring

1. **Vercel Analytics**: Monitor frontend performance
2. **Railway Logs**: Monitor worker health
3. **Neon Dashboard**: Monitor database performance
4. **Admin Dashboard**: Monitor endorsement collection

## 🚨 Troubleshooting

### Common Issues

1. **Workers Not Running**
   ```bash
   # Check Railway logs
   # Verify Redis connection
   # Check environment variables
   ```

2. **No New Endorsements**
   ```bash
   # Check RSS feed health
   # Verify keyword filters
   # Check AI classification logs
   ```

3. **Database Connection Issues**
   ```bash
   # Verify Neon connection string
   # Check database permissions
   # Test connection locally
   ```

### Health Checks

1. **Frontend**: `https://your-app.vercel.app/health`
2. **Workers**: Check Railway logs for health messages
3. **Database**: Test connection in Neon dashboard

## 📊 Monitoring & Alerts

### Key Metrics to Monitor

- **RSS Feed Health**: Success/failure rates
- **Endorsement Detection**: New endorsements found
- **AI Classification**: Confidence scores
- **Database Performance**: Query response times
- **Worker Health**: Uptime and error rates

### Alert Setup

1. **Vercel**: Set up alerts for deployment failures
2. **Railway**: Set up alerts for worker crashes
3. **Neon**: Set up alerts for database issues

## 🔄 Maintenance

### Regular Tasks

1. **Weekly**: Review and update RSS feed sources
2. **Monthly**: Clean up old job data
3. **Quarterly**: Update endorser influence scores
4. **As Needed**: Add new endorsers and candidates

### Updates

1. **Code Updates**: Push to main branch
2. **Database Migrations**: Run via admin panel
3. **Environment Variables**: Update in Vercel/Railway dashboards

## 🎯 Performance Optimization

### Frontend
- Use Next.js caching
- Optimize images and assets
- Implement proper loading states

### Backend
- Monitor Redis memory usage
- Optimize database queries
- Scale workers based on load

### Database
- Use connection pooling
- Implement proper indexing
- Monitor query performance

## 🔐 Security

### Environment Variables
- Never commit `.env` files
- Use Railway/Vercel secrets
- Rotate keys regularly

### Database Security
- Use SSL connections
- Implement proper access controls
- Regular security audits

### API Security
- Rate limiting on public endpoints
- Authentication for admin routes
- Input validation and sanitization
