# Build stage
FROM node:22 AS build

WORKDIR /app

# Copy root package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Run build with increased memory for Expo export
# Using npx expo export to ensure the local version is used
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Production stage
FROM node:22-slim

WORKDIR /app

# Copy built assets (Expo export output)
COPY --from=build /app/dist ./dist

# Copy backend code and dependencies
# The backend folder is copied as is, and root node_modules contains all production deps
COPY --from=build /app/backend ./backend
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

ENV NODE_ENV=production

# Start the unified server from the root
CMD ["npm", "run", "start:prod"]
