# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Set environment variables for build
ENV REACT_APP_SUPABASE_URL=https://eypavtzhqqkypqraooch.supabase.co
ENV REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5cGF2dHpocXFreXBxcmFvb2NoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1OTM2MTcsImV4cCI6MjA3ODE2OTYxN30.wKWTgz01u5lkDzFoxQchSbTePyFyjJEqKhchQkVVx0M

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]