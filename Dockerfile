FROM node:22-alpine

WORKDIR /app

# Copy workspace package files for deterministic install
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install all deps (dev included — needed for esbuild + tsc)
ENV HUSKY=0
RUN npm ci --legacy-peer-deps --include=dev

# Copy source
COPY . .

# Bundle API (esbuild compiles TS and inlines @campapp/shared)
RUN npm run build -w apps/api

# Drop dev deps for smaller image
RUN npm prune --omit=dev --legacy-peer-deps

EXPOSE 3000
CMD ["node", "apps/api/dist/index.js"]
