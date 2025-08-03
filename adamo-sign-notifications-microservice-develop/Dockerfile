# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Instalamos dependencias
COPY package*.json ./
RUN npm ci

# Copiamos el código y compilamos TS
COPY . .
RUN npm run build

# Segunda etapa: runtime
FROM node:20-alpine
WORKDIR /app

# Solo copiamos lo estrictamente necesario
COPY --from=builder /app/dist    ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json  ./
# no copies .env aquí si lo manejas con docker-compose env_file

EXPOSE 3500
CMD ["node", "dist/index.js"]
