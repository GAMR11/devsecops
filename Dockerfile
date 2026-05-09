# ---- Stage 1: Builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo dependencias de producción
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build compilado
COPY --from=builder /app/dist ./dist

# Usuario no-root por seguridad
USER node

EXPOSE 3000

CMD ["node", "dist/main"]
