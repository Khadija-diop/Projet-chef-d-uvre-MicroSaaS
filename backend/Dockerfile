# syntax=docker/dockerfile:1

# ---- deps + build -----------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# argon2 compile un addon natif : outils de build necessaires le temps de l'install.
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Installe aussi les devDependencies : "prisma" (CLI) est requis ici pour que le
# postinstall de @prisma/client telecharge le moteur binaire correspondant au schema.
RUN npm ci

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---- production ---------------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S app && adduser -S app -G app

COPY package.json package-lock.json ./
# "--omit=optional" exclut aussi le CLI "prisma" (outillage de dev, pas necessaire
# a l'execution)
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm ci --omit=dev --omit=optional \
    && apk del .build-deps

COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist

USER app
EXPOSE 3001
CMD ["node", "dist/server.js"]
