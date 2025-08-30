# Stage 1: Build the Vite React App
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package manager files & install dependencies
COPY package*.json bun.lockb ./
RUN npm install --legacy-peer-deps
# Copy the rest of the project & build
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx.conf (you already have it)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
