# ---- Dependencies ----
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN pnpm install --frozen-lockfile


# ---- Builder ----
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Dummy DB (no dependencia real en build)
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}

# Prisma se ejecuta vía postinstall, no hace falta repetirlo
RUN pnpm run build


# ---- Runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Healthcheck tool
RUN apk add --no-cache wget

# Usuario no root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 👉 Copiamos TODO el proyecto ya buildado
COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 👉 Usamos Next normal (compatible con PWA)
CMD ["npm", "start"]