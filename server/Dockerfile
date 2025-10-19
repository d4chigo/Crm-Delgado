# ============================================
# MULTI-STAGE BUILD para Backend (Node.js)
# ============================================

# Etapa 1: Build
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Generar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN pnpm run build

# ============================================
# Etapa 2: Production
FROM node:20-alpine AS production

# Instalar curl para healthchecks
RUN apk add --no-cache curl

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar package.json y lockfile
COPY --chown=nodejs:nodejs package*.json pnpm-lock.yaml ./

# Instalar solo dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# Copiar prisma schema
COPY --chown=nodejs:nodejs prisma ./prisma

# Copiar código compilado desde builder
COPY --chown=nodejs:nodejs --from=builder /app/dist ./dist
COPY --chown=nodejs:nodejs --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --chown=nodejs:nodejs --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 5000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=5000

# Script de inicio con migraciones
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/index.js"]
