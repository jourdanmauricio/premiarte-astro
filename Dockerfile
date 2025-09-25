# Usar Node.js 18 Alpine para una imagen más ligera
FROM node:18-alpine AS base

# Instalar dependencias necesarias para compilación
RUN apk add --no-cache libc6-compat

# Establecer directorio de trabajo
WORKDIR /app

# Instalar dependencias
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Etapa de construcción
FROM base AS builder
COPY package.json package-lock.json* ./
# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación con optimizaciones de memoria
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npm run build

# Etapa de producción
FROM base AS runtime

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 astro

# Copiar archivos necesarios
COPY --from=deps --chown=astro:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=astro:nodejs /app/dist ./dist
COPY --from=builder --chown=astro:nodejs /app/package.json ./package.json

# Ya no necesitamos directorio para SQLite local

# Cambiar al usuario no-root
USER astro

# Exponer puerto
EXPOSE 4321

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=4321
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "./dist/server/entry.mjs"] 