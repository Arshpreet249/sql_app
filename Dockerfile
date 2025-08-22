# Use Node.js 20 Alpine as base image for smaller size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Expose port 5173
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
