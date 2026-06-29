# Build stage
FROM node:22-bookworm AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Run build with increased memory for Expo export
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Prune dev dependencies for production
RUN npm prune --production

# Production stage
FROM node:22-bookworm-slim

WORKDIR /app

# Copy built assets (Expo export output)
COPY --from=build /app/dist ./dist

# Copy backend code and production dependencies
COPY --from=build /app/backend ./backend
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

# Start the unified server from the root
CMD ["npm", "run", "start:prod"]
