FROM node:20-alpine

WORKDIR /DataCollectionCloud

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY Web ./Web

# Build TypeScript to JavaScript
RUN npm run build

EXPOSE 5032

CMD ["node", "Web/dist/server.js"]