# HTTPS Development Setup

## Why HTTPS is Critical:

- **Encrypts all network traffic** - passwords can't be seen even with network monitoring
- **Prevents man-in-the-middle attacks**
- **Required for production** - all modern apps must use HTTPS

## Local HTTPS Setup for Development:

### Option 1: Use mkcert (Recommended)

```bash
# Install mkcert
npm install -g mkcert

# Create local CA
mkcert -install

# Generate certificate for localhost
mkcert localhost 127.0.0.1 ::1

# This creates:
# - localhost+2.pem (certificate)
# - localhost+2-key.pem (private key)
```

### Option 2: Use Next.js with HTTPS

```bash
# Install packages for HTTPS
npm install --save-dev https-localhost

# Update package.json script
"dev-https": "https-localhost --port 3000"
```

### Option 3: Use Cloudflare Tunnel (Easy)

```bash
# Install cloudflared
npm install -g @cloudflare/cloudflared

# Run tunnel
cloudflared tunnel --hello-world
# Then run your app and access via the https:// URL provided
```

## Production Deployment:

- **Vercel**: Automatic HTTPS
- **Netlify**: Automatic HTTPS
- **Railway**: Automatic HTTPS
- **Any hosting**: Use Let's Encrypt for free SSL

## Environment Variables for HTTPS:

```env
NEXTAUTH_URL=https://localhost:3000  # Use https://
# In production: https://yourdomain.com
```
