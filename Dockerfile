FROM ghcr.io/puppeteer/puppeteer:22.6.3

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

# Create the upload directory
RUN mkdir -p ./src/upload/PDF

# Change ownership of the upload directory to allow write permissions
RUN chown -R node:node ./src/upload

USER node

COPY package*.json ./
RUN npm ci
COPY . .

CMD ["node", "src/server.js"]
