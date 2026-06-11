# ─── Build Stage 1: Install dependencies ─────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

# ─── Build Stage 2: Build the application ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build args for NEXT_PUBLIC_ vars (required at build time)
ARG NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDjo5QgBrvBXPJnSpDI6dqNcCYRKqdL_fI
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=hack2skill-a226e.firebaseapp.com
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID=hack2skill-a226e
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=hack2skill-a226e.firebasestorage.app
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=376597987794
ARG NEXT_PUBLIC_FIREBASE_APP_ID=1:376597987794:web:4c02f1467a990a3941480b
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-G-X143GWLBTT
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyBTX6aQ-6AdVQwLh7iCQ_ckza_s33jBTpM

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ─── Build Stage 3: Production runner ────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy minimal standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
