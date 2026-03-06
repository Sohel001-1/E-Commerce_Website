FROM node:20-alpine
WORKDIR /app
COPY package*.json ./

# The fix: Adding legacy-peer-deps to handle React 19 conflicts
RUN npm ci --omit=dev --legacy-peer-deps

COPY . .
ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000
CMD ["node", "server.js"]