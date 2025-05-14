FROM node:18-alpine

# Add node user
RUN addgroup -S nodejs && adduser -S nodejs -G nodejs

# Create app directory
WORKDIR /app

# Copy both package.json and package-lock.json
COPY package*.json ./

# Now we can use npm ci safely
RUN npm ci

# Change ownership of the /app directory to nodejs user
COPY --chown=nodejs:nodejs . .

# Build the application
RUN npm run build

# Use nodejs user
USER nodejs

ENV NODE_ENV=production
EXPOSE 3000

CMD ["npm", "run", "start:prod"]