# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
RUN mkdir -p /app/data
RUN apk update && apk upgrade --no-cache \
    && apk add --no-cache expat tiff
ENV PORT=3000
EXPOSE 3000
CMD ["node", "src/index.js"]
