# Build stage
FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.5.0 --activate

COPY backend/package.json backend/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --prod --ignore-scripts

COPY backend/prisma ./prisma/
COPY backend/prisma.config.ts ./prisma.config.ts

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/scripts ./scripts/
COPY frontend ./frontend/

# Runtime stage
FROM node:22-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache tini

ENV NODE_ENV=development
ENV PORT=3000

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
COPY --from=build /app/frontend ./frontend
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./
COPY --from=build /app/scripts ./scripts

EXPOSE 3000

ENTRYPOINT ["tini", "--"]
CMD ["sh", "-c", "npx prisma migrate deploy --config=./prisma.config.ts && node scripts/seed.js && node src/server.js"]