# ---- Build Stage ----
# Use a lightweight version of Node.js
FROM node:24-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the source code
COPY . .

# Tell Docker this container listens on port 3000
EXPOSE 3000

# Start the app
CMD ["node", "src/index.js"]
