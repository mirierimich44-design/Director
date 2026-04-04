#!/bin/bash
# Fix nginx config for Director — sets upload limit and proxy settings
# Run with: bash ~/Director/deploy/setup-nginx.sh

set -e

NGINX_CONF="/etc/nginx/nginx.conf"
SITE_CONF="/etc/nginx/sites-available/director"
SITE_LINK="/etc/nginx/sites-enabled/director"

echo "==> Setting client_max_body_size in $NGINX_CONF"

# Remove any previous broken attempts first
sudo sed -i '/client_max_body_size/d' "$NGINX_CONF"
sudo sed -i '/^\.\.\./d' "$NGINX_CONF"

# Insert client_max_body_size after the http { line
sudo sed -i 's|http {|http {\n    client_max_body_size 200M;|' "$NGINX_CONF"

echo "==> Writing Director site config to $SITE_CONF"

sudo tee "$SITE_CONF" > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 200M;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 600s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 600s;
    }
}
EOF

echo "==> Enabling site"
sudo ln -sf "$SITE_CONF" "$SITE_LINK"

# Disable default site if it exists
if [ -f /etc/nginx/sites-enabled/default ]; then
    sudo rm /etc/nginx/sites-enabled/default
    echo "==> Disabled default nginx site"
fi

echo "==> Testing nginx config"
sudo nginx -t

echo "==> Reloading nginx"
sudo systemctl reload nginx

echo ""
echo "Done! Verifying limit:"
nginx -T 2>/dev/null | grep client_max_body_size
