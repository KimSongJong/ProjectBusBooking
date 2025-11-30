# ============================================
# DOCKERFILE FOR BUS BOOKING FRONTEND
# ============================================
# React + Vite application with Nginx
# ============================================

# Stage 1: Build with Node
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables for build
ENV NODE_ENV=production
ENV VITE_API_URL=http://localhost:8080/api

# Build for production (skip TypeScript checking for Docker build)
# Use vite build directly instead of the "build" script which includes tsc
RUN pnpm vite build --mode production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

