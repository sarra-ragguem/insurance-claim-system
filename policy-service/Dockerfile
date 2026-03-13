FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code (including .proto file)
COPY . .

# Expose gRPC port
EXPOSE 4002

# Start the gRPC server
CMD ["npm", "start"]
