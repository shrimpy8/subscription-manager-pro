# Supabase Production Deployment Guide

This guide covers deploying the Subscription Manager Pro application with Supabase to production.

## Prerequisites

- [ ] Supabase account and project created
- [ ] Node.js 18+ installed
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] Production environment variables configured
- [ ] Domain and SSL certificate ready

## Environment Setup

### 1. Create Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Note down your project URL and API keys
4. Configure your project settings

### 2. Configure Environment Variables

Copy the example environment file and configure your production values:

```bash
cp env.production.example .env.production
```

Fill in your production values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_PROJECT_ID=your-project-id-here
SUPABASE_REGION=us-east-1

# Environment
NODE_ENV=production

# Security
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

### 3. Database Schema Deployment

Deploy the database schema to production:

```bash
# Link to your Supabase project
supabase link --project-ref your-project-id

# Deploy migrations
supabase db push

# Verify schema
supabase db diff
```

## Security Configuration

### 1. Row Level Security (RLS)

Enable RLS on all tables:

```sql
-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for user access
CREATE POLICY "Users can access their own subscriptions" ON subscriptions
    FOR ALL USING (auth.uid() = user_id);
```

### 2. API Security

Configure API security settings:

- **Rate Limiting**: 60 requests per minute
- **CORS**: Configure allowed origins
- **Headers**: Security headers enabled
- **Authentication**: JWT tokens required

### 3. Environment Security

- Use strong, unique secrets
- Rotate keys regularly
- Monitor access logs
- Enable audit logging

## Deployment Process

### 1. Pre-deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] Security policies configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented

### 2. Deploy Application

```bash
# Install dependencies
npm install

# Build application
npm run build

# Run deployment script
chmod +x scripts/deploy-supabase.sh
./scripts/deploy-supabase.sh
```

### 3. Post-deployment Verification

```bash
# Test production health
npm run test:production

# Verify database connection
npm run test:database

# Check security configuration
npm run test:security
```

## Monitoring and Logging

### 1. Application Monitoring

- **Health Checks**: Automated health monitoring
- **Performance**: Response time and throughput monitoring
- **Errors**: Error tracking and alerting
- **Usage**: User activity and feature usage

### 2. Database Monitoring

- **Query Performance**: Slow query detection
- **Connection Pool**: Connection monitoring
- **Storage**: Database size and growth
- **Backups**: Backup status and integrity

### 3. Security Monitoring

- **Access Logs**: User access patterns
- **Failed Logins**: Authentication failures
- **API Usage**: API endpoint usage
- **Data Access**: Data access patterns

## Backup and Recovery

### 1. Database Backups

```bash
# Create manual backup
supabase db dump --project-ref your-project-id > backup.sql

# Schedule automated backups
# Configure in Supabase dashboard
```

### 2. Disaster Recovery

- **RTO**: 4 hours (Recovery Time Objective)
- **RPO**: 1 hour (Recovery Point Objective)
- **Backup Frequency**: Daily
- **Retention**: 30 days

### 3. Data Migration

```bash
# Export data from development
supabase db dump --project-ref dev-project-id > dev-data.sql

# Import to production
supabase db reset --project-ref prod-project-id
psql -h your-host -U your-user -d your-db < dev-data.sql
```

## Performance Optimization

### 1. Database Optimization

- **Indexes**: Optimize query performance
- **Connection Pooling**: Configure connection limits
- **Query Optimization**: Monitor slow queries
- **Caching**: Implement query caching

### 2. Application Optimization

- **CDN**: Use CDN for static assets
- **Caching**: Implement application caching
- **Compression**: Enable gzip compression
- **Minification**: Minify JavaScript and CSS

### 3. Monitoring Performance

- **APM**: Application Performance Monitoring
- **Metrics**: Key performance indicators
- **Alerts**: Performance threshold alerts
- **Reports**: Regular performance reports

## Troubleshooting

### Common Issues

1. **Connection Timeouts**
   - Check network connectivity
   - Verify Supabase URL and keys
   - Check firewall settings

2. **Authentication Errors**
   - Verify JWT token configuration
   - Check user permissions
   - Validate API keys

3. **Database Errors**
   - Check RLS policies
   - Verify table permissions
   - Check data integrity

### Debug Commands

```bash
# Check Supabase connection
npm run debug:supabase

# Test database queries
npm run debug:database

# Verify security settings
npm run debug:security
```

## Maintenance

### Regular Tasks

- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Disaster recovery test

### Updates

- **Dependencies**: Keep dependencies updated
- **Security**: Apply security patches
- **Features**: Deploy new features
- **Bug Fixes**: Deploy bug fixes

## Support

### Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Documentation](./README.md)

### Contact

- **Technical Issues**: Create GitHub issue
- **Security Issues**: Email security team
- **General Support**: Contact support team

## Changelog

### Version 1.0.0
- Initial production deployment
- Supabase integration
- Security configuration
- Monitoring setup

---

**Last Updated**: 2024-10-06
**Version**: 1.0.0
**Status**: Production Ready
