FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --chown=node:node . .
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3030
USER node
EXPOSE 3030
CMD ["node","index.js"]
