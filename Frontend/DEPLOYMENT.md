# Deployment Guide - Schools Management System Frontend

## Pre-Deployment Checklist

### Code Quality
- [ ] All TypeScript types are properly defined
- [ ] No console.log or debug statements in production code
- [ ] All environment variables are set in `.env.local`
- [ ] API endpoints are correctly configured
- [ ] Authentication flow is working correctly

### Performance
- [ ] Images are optimized and use Next.js Image component
- [ ] Code splitting is properly configured
- [ ] CSS is minified
- [ ] JavaScript bundles are optimized
- [ ] Lighthouse score is > 90

### Security
- [ ] HTTPS is enabled
- [ ] No sensitive data in code
- [ ] CORS headers are configured
- [ ] API keys are stored securely (not in code)
- [ ] Password hashing is implemented
- [ ] SQL injection prevention is in place

### Testing
- [ ] Unit tests are written and passing
- [ ] Integration tests are passing
- [ ] E2E tests are passing
- [ ] Manual testing on multiple browsers completed
- [ ] Mobile responsiveness tested

### SEO & Accessibility
- [ ] Meta tags are properly set
- [ ] Open Graph tags are configured
- [ ] Alt text for images is present
- [ ] ARIA labels are used appropriately
- [ ] Keyboard navigation is working

## Environment Setup

### 1. Production Environment Variables
Create a `.env.local` file with the following:

```bash
NEXT_PUBLIC_BACKEND_URL=https://your-production-api.com
NEXT_PUBLIC_AUTH_DOMAIN=your-domain.com
NEXT_PUBLIC_AUTH_CLIENT_ID=your-client-id
NODE_ENV=production
```

### 2. Backend Configuration
Ensure your backend API is:
- Deployed and running
- CORS headers properly configured
- All required endpoints implemented
- API documentation updated

## Deployment Steps

### To Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel link
   ```

2. **Set Environment Variables**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Add all variables from `.env.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Verify Deployment**
   - Check that all pages load correctly
   - Test login and authentication
   - Verify API calls are working
   - Test on mobile devices

### To Other Platforms

#### Docker Deployment
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Manual Server Deployment
```bash
# Build the application
npm run build

# Start the production server
npm start

# Or use PM2 for process management
pm2 start npm --name "schools-cms" -- start
pm2 save
pm2 startup
```

## Post-Deployment Tasks

### Monitoring
- [ ] Set up error tracking (Sentry recommended)
- [ ] Enable performance monitoring
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation

### Analytics
- [ ] Verify Google Analytics is working
- [ ] Set up user session tracking
- [ ] Configure conversion tracking

### Backups & Recovery
- [ ] Database backups are scheduled
- [ ] Backup restoration process is tested
- [ ] Disaster recovery plan is documented

### Updates & Maintenance
- [ ] Set up automated dependency updates
- [ ] Plan security patch schedule
- [ ] Document rollback procedures
- [ ] Plan for scaling if needed

## Troubleshooting

### Build Issues
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### API Connection Issues
- Verify `NEXT_PUBLIC_BACKEND_URL` is correct
- Check CORS headers on backend
- Verify network connectivity
- Check browser console for errors

### Performance Issues
- Check Vercel Analytics
- Use Next.js built-in performance monitoring
- Optimize large images
- Enable caching headers

### Security Issues
- Update all dependencies
- Run security audit: `npm audit`
- Review CORS configuration
- Check for exposed secrets

## Rollback Procedure

If issues occur after deployment:

1. **Vercel Rollback**
   ```bash
   vercel rollback
   ```

2. **Manual Rollback**
   - Redeploy previous version from git tag
   - Verify all systems are working

## Monitoring & Alerts

Set up alerts for:
- Deployment failures
- API errors (500+ responses)
- Performance degradation (>3s page load)
- Uptime monitoring (>99.9%)
- Database connection issues

## Support & Escalation

For deployment issues:
1. Check Vercel Logs
2. Review error tracking service
3. Check API backend status
4. Verify environment variables
5. Contact support if issues persist

## Useful Links

- [Vercel Deployment Docs](https://vercel.com/docs)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Security Best Practices](https://owasp.org/www-project-web-security-testing-guide/)
- [Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
