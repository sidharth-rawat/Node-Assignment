# Stage 1: Build stage
FROM ghcr.io/puppeteer/puppeteer:22.6.3 AS build

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Create the upload directory
RUN mkdir -p ./src/upload/PDF

# Create the logs directory
RUN mkdir -p ./logs

COPY package*.json ./
RUN npm ci
COPY . .

# Stage 3: Set permissions stage
FROM build AS setpermissions

USER root
RUN chown -R node:node ./src/upload ./logs

USER node

# Final stage
FROM setpermissions AS final

CMD ["node", "src/server.js"]
