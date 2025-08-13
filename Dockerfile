# Use Node.js 22.16.0 (matching Render's default)
FROM node:22.16.0-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build client
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]