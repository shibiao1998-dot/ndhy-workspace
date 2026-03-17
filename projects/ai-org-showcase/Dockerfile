FROM caddy:2-alpine

# Copy Caddyfile
COPY Caddyfile /etc/caddy/Caddyfile

# Copy Astro build output (V5)
COPY website/dist/ /srv/

# Expose port 80
EXPOSE 80

# Resource limits are set via docker-compose
# Caddy runs as non-root by default in the official image
