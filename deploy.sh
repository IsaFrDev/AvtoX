#!/bin/bash
set -e

echo "=== AvtoX Deploy ==="

# 1. Pull latest
git pull origin main

# 2. Apply nginx config (if nginx is installed)
if command -v nginx &> /dev/null; then
  NGINX_CONF="/etc/nginx/sites-available/avtox"
  cp "$(dirname "$0")/nginx.conf" "$NGINX_CONF"
  ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/avtox
  nginx -t && systemctl reload nginx
  echo "nginx reloaded"
fi

echo "=== Deploy complete. Site is live ==="
