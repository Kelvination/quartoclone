# 🚀 Complete Deployment Guide for kelvinnewton.com

This guide covers everything you need to know about your multi-site deployment setup.

## 📋 Quick Reference

- **Domain**: `kelvinnewton.com`
- **Server IP**: `54.158.240.191` (Elastic IP - permanent)
- **SSH Key**: `~/.ssh/quartoclone-key.pem`
- **GitHub Repository**: https://github.com/Kelvination/quartoclone

## 🌐 Site Structure

Your domain is configured to host multiple sites:

```
kelvinnewton.com/
├── /                    → Redirects to /portfolio/
├── /quartoclone/        → QuartoClone multiplayer game
├── /portfolio/          → Your portfolio site (placeholder)
└── /[project-name]/     → Future projects
```

## 🔧 Manual Setup Steps

### 1. Domain Configuration (Namecheap)

1. Log into your **Namecheap account**
2. Go to **Domain List** → Click **"Manage"** next to `kelvinnewton.com`
3. Click **"Advanced DNS"** tab
4. Add these records:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A | @ | 54.158.240.191 | Automatic |
   | A | www | 54.158.240.191 | Automatic |

5. Wait 5-30 minutes for DNS propagation

### 2. SSH Access

Connect to your server:
```bash
ssh -i ~/.ssh/quartoclone-key.pem ubuntu@54.158.240.191
```

### 3. Current Services

Your server runs:
- **Frontend**: Nginx on port 80 (serves all sites)
- **Backend**: Node.js server on port 5175 (QuartoClone API)

## 🔄 CI/CD Pipeline

### Automatic Deployment

Every push to the `main` branch automatically:
1. Builds the client application
2. Deploys to your server
3. Restarts services

Just push your changes:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

### GitHub Actions Configuration

The pipeline is configured with these secrets:
- `HOST`: 54.158.240.191
- `USERNAME`: ubuntu
- `KEY`: Your SSH private key

## 🏗️ Adding New Sites

### Quick Setup for a New Project

1. **Create project directory** on server:
   ```bash
   sudo mkdir -p /var/www/your-project-name
   sudo chown ubuntu:ubuntu /var/www/your-project-name
   ```

2. **Upload your files** to `/var/www/your-project-name/`

3. **Access at**: `kelvinnewton.com/your-project-name/`

### For React/Vue/Angular Apps

For single-page applications, you may need to modify the nginx config to handle client-side routing.

## 🔒 SSL/HTTPS Setup

### Current Status
- SSL is **prepared** but not active
- Site currently runs on HTTP (port 80)

### To Enable HTTPS:

1. **Stop nginx temporarily**:
   ```bash
   sudo systemctl stop nginx
   ```

2. **Get SSL certificate**:
   ```bash
   sudo certbot certonly --standalone -d kelvinnewton.com -d www.kelvinnewton.com
   ```

3. **Update nginx config** to include SSL blocks

4. **Start nginx**:
   ```bash
   sudo systemctl start nginx
   ```

## 🛠️ Common Tasks

### Restart Services
```bash
# Restart nginx
sudo systemctl restart nginx

# Restart QuartoClone API
sudo pkill -f "node index.js"
cd /home/ubuntu/quartoclone/server
nohup node index.js > server.log 2>&1 &
```

### Check Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# QuartoClone server logs
tail -f /home/ubuntu/quartoclone/server/server.log
```

### Update DNS for New Subdomain
If you want subdomains like `game.kelvinnewton.com`:
1. Add CNAME record in Namecheap: `game` → `kelvinnewton.com`
2. Update nginx config to handle the new subdomain

## 🚨 Troubleshooting

### Site Not Loading
1. Check nginx status: `sudo systemctl status nginx`
2. Check nginx config: `sudo nginx -t`
3. Check DNS propagation: `nslookup kelvinnewton.com`

### API Not Working
1. Check Node.js process: `ps aux | grep node`
2. Check server logs: `tail -f ~/quartoclone/server/server.log`
3. Restart server if needed (see "Restart Services" above)

### CI/CD Pipeline Failing
1. Check GitHub Actions logs in your repository
2. Verify SSH key access: `ssh -i ~/.ssh/quartoclone-key.pem ubuntu@54.158.240.191`
3. Check server disk space: `df -h`

## 📁 File Locations

```
/home/ubuntu/quartoclone/          # Main application
├── client/dist/                   # Built React app
├── server/                        # Node.js API
└── .git/                          # Git repository

/var/www/                          # Additional sites
├── portfolio/                     # Your portfolio
└── [other-projects]/              # Future projects

/etc/nginx/                        # Nginx configuration
├── sites-available/kelvinnewton.com
└── sites-enabled/kelvinnewton.com
```

## 🔐 Security Notes

- SSH key is stored locally: `~/.ssh/quartoclone-key.pem`
- Server automatically updates packages on deployment
- Nginx includes basic security headers
- Consider enabling fail2ban for additional SSH protection

## 💡 Tips

1. **Always test locally** before pushing to main
2. **Use branches** for new features, merge to main when ready
3. **Monitor your AWS usage** - you're on a t3.micro instance
4. **Backup important data** regularly
5. **Keep your domain renewed** in Namecheap

## 🆘 Need Help?

If something goes wrong:
1. Check this guide first
2. Look at the error logs
3. Try restarting the relevant service
4. If all else fails, you can recreate the server following this guide

---

**Last Updated**: September 2025  
**Server**: AWS EC2 t3.micro (us-east-1)  
**Domain**: kelvinnewton.com via Namecheap