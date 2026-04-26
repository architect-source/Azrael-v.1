# AZRAEL CORE: DOCKERFILE
FROM node:20-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the frontend assets for the "Truth Giver" interface
RUN npm run build

# Cloud Run default port
ENV PORT=8080
EXPOSE 8080

# Ignite the Sentry
CMD ["npm", "start"]
