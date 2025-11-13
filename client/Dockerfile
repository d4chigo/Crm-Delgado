# ============================================
# MULTI-STAGE BUILD para Frontend (Next.js)
# ============================================

# Etapa 1: Dependencies
FROM node:20-alpine AS deps

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias (sin frozen-lockfile para permitir actualizaciones)
RUN pnpm install --no-frozen-lockfile

# ============================================
# Etapa 2: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias instaladas
COPY --from=deps /app/node_modules ./node_modules

# Copiar código fuente
COPY . .

# Copiar esquema Prisma y generar cliente
COPY prisma ./prisma
RUN npx prisma generate

# Variables de entorno de build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Deshabilitar telemetría de Next.js
ENV NEXT_TELEMETRY_DISABLED 1

# Build de Next.js (standalone para producción)
RUN npm install -g pnpm && pnpm run build

# ============================================
# Etapa 3: Production
FROM node:20-alpine AS production

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1

# Copiar archivos necesarios para producción
COPY --from=builder --chown=nodejs:nodejs /app/public ./public
COPY --from=builder --chown=nodejs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nodejs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Generar Prisma Client en producción
RUN npm install -g pnpm \
  && pnpm add -D prisma \
  && pnpm add @prisma/client \
  && npx prisma generate

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar Next.js
CMD ["node", "server.js"]
