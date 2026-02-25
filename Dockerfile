# Stage 1: Build the Next.js app
FROM node:22-slim AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

# Stage 2: Production image with pm2, nginx, and sendmail
FROM node:22-slim

# Install nginx, sendmail, and pm2
RUN apt-get update \
    && apt-get install -y --fix-missing nginx sendmail tzdata \
    && npm install -g pm2 \
    && rm -rf /var/lib/apt/lists/*

# Set timezone to America/Toronto
ENV DEBIAN_FRONTEND=noninteractive
RUN ln -snf /usr/share/zoneinfo/America/Toronto /etc/localtime \
    && echo "America/Toronto" > /etc/timezone \
    && dpkg-reconfigure -f noninteractive tzdata

# Copy the Next.js build from the builder stage
WORKDIR /app
COPY --from=builder /app ./

# Remove the default Nginx configuration
RUN rm /etc/nginx/sites-available/default \
    && rm /etc/nginx/sites-enabled/default

# Copy the custom Nginx configuration
COPY ./default.conf /etc/nginx/sites-available/default
RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Expose the application port
EXPOSE 8000

# Start pm2 for Next.js and Nginx
CMD ["sh", "-c", "pm2 start npm --name 'nextjs' -- run start && nginx -g 'daemon off;'"]
