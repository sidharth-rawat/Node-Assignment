# Stage 1: Build stage
FROM ghcr.io/puppeteer/puppeteer:22.6.3 AS build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Create the upload directory
RUN mkdir -p ./src/upload/PDF

COPY package*.json ./
RUN npm ci
COPY . .

# Create logs directory with appropriate permissions
RUN mkdir -p /usr/src/app/logs && \
    chown -R node:node /usr/src/app/logs

# Stage 2: Set permissions stage
FROM build AS setpermissions

USER root
RUN chown -R node:node ./src/upload

USER node

# Final stage
FROM setpermissions AS final

CMD ["node", "src/server.js"]
