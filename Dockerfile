FROM node:20-alpine AS base

# Install deps
RUN apk add --no-cache openssl bash

WORKDIR /app
COPY package*.json ./
RUN yarn

FROM base AS dev
COPY . .
# RUN yarn generate
CMD ["yarn", "dev"]

FROM base AS prod
COPY . .
RUN yarn build && yarn generate
CMD ["node", "dist/main"]
