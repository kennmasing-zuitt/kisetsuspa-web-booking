# syntax=docker/dockerfile:1
# Builds the static site (next build -> out/) and serves it with a tiny Nginx at /book/.

# ---------- 1. build ----------
FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are baked into the files at BUILD time (rebuild after changing them)
ARG NEXT_PUBLIC_BOOKING_API_URL
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_BASE_PATH=/book
ARG NEXT_PUBLIC_MOCK_API=false
ENV NEXT_PUBLIC_BOOKING_API_URL=$NEXT_PUBLIC_BOOKING_API_URL \
    NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY \
    NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH \
    NEXT_PUBLIC_MOCK_API=$NEXT_PUBLIC_MOCK_API
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- 2. serve ----------
FROM nginx:1.27-alpine
COPY deploy/site.conf /etc/nginx/conf.d/default.conf
# out/ is the site root; it is served under /book/ (see site.conf)
COPY --from=builder /app/out /usr/share/nginx/html/book
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://127.0.0.1/book/ >/dev/null || exit 1
