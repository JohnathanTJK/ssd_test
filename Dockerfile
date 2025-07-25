# Use official Node.js image
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Expose the app port
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]
