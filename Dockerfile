# Build stage
FROM node:20 AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm ci

# Copy backend package files
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy the rest of the application
COPY . .

# Run build with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy built assets
COPY --from=build /app/dist ./dist

# Copy backend code and dependencies
COPY --from=build /app/backend ./backend
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

# Start the unified server
CMD ["npm", "run", "start:prod"]
