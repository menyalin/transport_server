# Builder stage
FROM node:lts-alpine AS builder

WORKDIR /app

# Копируем только package файлы - этот слой кешируется при неизменных зависимостях
COPY package*.json ./
RUN npm ci

# Копируем конфигурацию и исходники
COPY tsconfig.json jest.config.js ./
COPY src ./src
RUN npm run build

# Production образ без dev зависимостей
FROM node:lts-alpine
WORKDIR /app
ENV NODE_ENV=production

# Копируем только необходимое из builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY templates ./templates
COPY emailTemplates ./emailTemplates

EXPOSE 3000
CMD ["node", "./dist/bin/www.js"]
