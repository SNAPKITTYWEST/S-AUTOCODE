# S-AUTOCODE Deployment Guide

Complete instructions for deploying S-AUTOCODE to production.

---

## Deployment Options

1. **GitHub Pages** (Recommended) - Free, automatic, CDN
2. **Vercel** - Fast, automatic deployments
3. **Netlify** - Easy setup, continuous deployment
4. **Self-Hosted** - Full control, custom domain

---

## GitHub Pages Deployment

### Prerequisites

- GitHub account
- Repository with S-AUTOCODE code
- WASM binaries built (see BUILD.md)

### Method 1: Automatic Deployment (Recommended)

#### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          target: wasm32-unknown-unknown
      
      - name: Install wasm-pack
        run: cargo install wasm-pack
      
      - name: Build WASM
        run: |
          cd src/wasm
          wasm-pack build --target web --release --out-dir ../../
      
      - name: Setup Pages
        uses: actions/configure-pages@v3
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: '.'
      
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2
```

#### Step 2: Enable GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages** section
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Save changes

#### Step 3: Trigger Deployment

```bash
# Commit and push
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment"
git push origin master

# Deployment will start automatically
```

#### Step 4: Verify Deployment

- Visit: `https://[username].github.io/S-AUTOCODE/`
- Check Actions tab for deployment status
- Wait 2-5 minutes for first deployment

### Method 2: Manual Deployment

#### Step 1: Build WASM

```bash
cd src/wasm
wasm-pack build --target web --release --out-dir ../../
cd ../..
```

#### Step 2: Create `gh-pages` Branch

```bash
# Create orphan branch
git checkout --orphan gh-pages

# Add all files
git add .
git commit -m "Deploy to GitHub Pages"

# Push to GitHub
git push origin gh-pages

# Return to master
git checkout master
```

#### Step 3: Configure GitHub Pages

1. Go to repository **Settings**
2. Navigate to **Pages**
3. Under **Source**, select:
   - Branch: **gh-pages**
   - Folder: **/ (root)**
4. Save and wait for deployment

---

## Vercel Deployment

### Prerequisites

- Vercel account (free)
- Vercel CLI (optional)

### Method 1: Web Interface

1. Visit https://vercel.com
2. Click **Import Project**
3. Select your GitHub repository
4. Configure:
   - **Framework Preset:** Other
   - **Build Command:** `cd src/wasm && wasm-pack build --target web --release --out-dir ../../`
   - **Output Directory:** `.`
5. Click **Deploy**

### Method 2: CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Follow prompts
```

### Custom Domain

1. Go to project settings
2. Navigate to **Domains**
3. Add your custom domain
4. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Netlify Deployment

### Prerequisites

- Netlify account (free)
- Netlify CLI (optional)

### Method 1: Drag and Drop

1. Build WASM locally:
   ```bash
   cd src/wasm
   wasm-pack build --target web --release --out-dir ../../
   ```

2. Visit https://app.netlify.com/drop
3. Drag project folder to upload
4. Site will be deployed instantly

### Method 2: Git Integration

1. Visit https://app.netlify.com
2. Click **New site from Git**
3. Connect to GitHub
4. Select repository
5. Configure:
   - **Build command:** `cd src/wasm && wasm-pack build --target web --release --out-dir ../../`
   - **Publish directory:** `.`
6. Click **Deploy site**

### Method 3: CLI

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod

# Follow prompts
```

### Custom Domain

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain
4. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: [your-site].netlify.app
   ```

---

## Self-Hosted Deployment

### Nginx Configuration

#### Step 1: Build and Copy Files

```bash
# Build WASM
cd src/wasm
wasm-pack build --target web --release --out-dir ../../
cd ../..

# Copy to web root
sudo cp -r . /var/www/s-autocode/
```

#### Step 2: Configure Nginx

Create `/etc/nginx/sites-available/s-autocode`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name s-autocode.example.com;
    
    root /var/www/s-autocode;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/wasm;
    
    # WASM MIME type
    location ~* \.wasm$ {
        types { application/wasm wasm; }
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # JavaScript files
    location ~* \.js$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # HTML files (no cache)
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### Step 3: Enable Site

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/s-autocode /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

#### Step 4: SSL with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d s-autocode.example.com

# Auto-renewal is configured automatically
```

### Apache Configuration

#### Step 1: Copy Files

```bash
sudo cp -r . /var/www/s-autocode/
```

#### Step 2: Configure Apache

Create `/etc/apache2/sites-available/s-autocode.conf`:

```apache
<VirtualHost *:80>
    ServerName s-autocode.example.com
    DocumentRoot /var/www/s-autocode
    
    <Directory /var/www/s-autocode>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    # WASM MIME type
    AddType application/wasm .wasm
    
    # Compression
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/css application/json application/javascript text/xml application/xml application/wasm
    </IfModule>
    
    # Caching
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType application/wasm "access plus 1 year"
        ExpiresByType application/javascript "access plus 1 year"
        ExpiresByType text/css "access plus 1 year"
        ExpiresByType text/html "access plus 0 seconds"
    </IfModule>
    
    # SPA routing
    <IfModule mod_rewrite.c>
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </IfModule>
    
    ErrorLog ${APACHE_LOG_DIR}/s-autocode-error.log
    CustomLog ${APACHE_LOG_DIR}/s-autocode-access.log combined
</VirtualHost>
```

#### Step 3: Enable Site

```bash
# Enable modules
sudo a2enmod rewrite expires deflate headers

# Enable site
sudo a2ensite s-autocode

# Test configuration
sudo apache2ctl configtest

# Reload Apache
sudo systemctl reload apache2
```

---

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Build stage
FROM rust:1.70 as builder

WORKDIR /app
COPY . .

# Install wasm-pack
RUN cargo install wasm-pack

# Build WASM
RUN cd src/wasm && wasm-pack build --target web --release --out-dir ../../

# Production stage
FROM nginx:alpine

# Copy built files
COPY --from=builder /app /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf for Docker

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location ~* \.wasm$ {
        types { application/wasm wasm; }
        add_header Cache-Control "public, max-age=31536000";
    }
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Build and Run

```bash
# Build image
docker build -t s-autocode .

# Run container
docker run -d -p 8080:80 --name s-autocode s-autocode

# Visit http://localhost:8080
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  s-autocode:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

---

## CDN Configuration

### Cloudflare

1. Add site to Cloudflare
2. Update nameservers
3. Configure caching rules:
   - **WASM files:** Cache everything, 1 year
   - **JS/CSS:** Cache everything, 1 year
   - **HTML:** Bypass cache

### CloudFront (AWS)

1. Create S3 bucket
2. Upload files to S3
3. Create CloudFront distribution
4. Configure:
   - **Origin:** S3 bucket
   - **Viewer Protocol:** Redirect HTTP to HTTPS
   - **Compress Objects:** Yes
5. Update DNS to point to CloudFront

---

## Environment Variables

### Production Configuration

Create `.env.production`:

```bash
# API endpoints (if needed)
VITE_API_URL=https://api.s-autocode.com

# Analytics (optional)
VITE_ANALYTICS_ID=UA-XXXXXXXXX-X

# Feature flags
VITE_ENABLE_WASM=true
VITE_ENABLE_AGENTS=true
```

### Build with Environment

```bash
# Load environment
source .env.production

# Build
cd src/wasm
wasm-pack build --target web --release --out-dir ../../
```

---

## Performance Optimization

### 1. Enable Compression

**Nginx:**
```nginx
gzip on;
gzip_types application/wasm application/javascript text/css;
```

**Apache:**
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE application/wasm
</IfModule>
```

### 2. Set Cache Headers

```nginx
location ~* \.wasm$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

### 3. Enable HTTP/2

**Nginx:**
```nginx
listen 443 ssl http2;
```

**Apache:**
```apache
Protocols h2 http/1.1
```

### 4. Preload Critical Resources

Add to `index.html`:
```html
<link rel="preload" href="autocode_wasm_bg.wasm" as="fetch" crossorigin>
<link rel="preload" href="autocode_wasm.js" as="script">
```

---

## Monitoring

### Health Check Endpoint

Add to server config:

```nginx
location /health {
    access_log off;
    return 200 "OK\n";
    add_header Content-Type text/plain;
}
```

### Uptime Monitoring

Use services like:
- **UptimeRobot** (free)
- **Pingdom**
- **StatusCake**

Configure to check:
- `https://your-domain.com/health`
- Every 5 minutes
- Alert on failure

---

## Security

### 1. HTTPS Only

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name s-autocode.example.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. Security Headers

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;
```

### 3. Rate Limiting

```nginx
limit_req_zone $binary_remote_addr zone=one:10m rate=10r/s;

location / {
    limit_req zone=one burst=20;
}
```

---

## Rollback Procedure

### GitHub Pages

```bash
# Revert to previous commit
git revert HEAD
git push origin master

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin master
```

### Vercel/Netlify

1. Go to **Deployments**
2. Find previous working deployment
3. Click **Promote to Production**

### Self-Hosted

```bash
# Keep backups
sudo cp -r /var/www/s-autocode /var/www/s-autocode.backup

# Restore if needed
sudo rm -rf /var/www/s-autocode
sudo mv /var/www/s-autocode.backup /var/www/s-autocode
sudo systemctl reload nginx
```

---

## Troubleshooting

### Issue: WASM fails to load

**Check:**
1. MIME type configured correctly
2. CORS headers set
3. HTTPS enabled (required for some browsers)

**Solution:**
```nginx
location ~* \.wasm$ {
    types { application/wasm wasm; }
    add_header Access-Control-Allow-Origin "*";
}
```

### Issue: 404 on page refresh

**Cause:** SPA routing not configured

**Solution:**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### Issue: Slow initial load

**Solutions:**
1. Enable compression
2. Add CDN
3. Preload WASM
4. Use HTTP/2

---

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] WASM module initializes
- [ ] All routes work
- [ ] Terminal commands execute
- [ ] Agent chat functions
- [ ] HTTPS enabled
- [ ] Security headers set
- [ ] Compression enabled
- [ ] Monitoring configured
- [ ] Backup strategy in place

---

## Further Reading

- **BUILD.md** - Build instructions
- **USER_GUIDE.md** - User documentation
- **API.md** - API reference

---

**Questions?** Open an issue at https://github.com/SNAPKITTYWEST/S-AUTOCODE/issues

**Happy deploying!** 🚀