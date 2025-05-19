FROM node:18-alpine as builder

WORKDIR /app

# Force Docker to re-run npm install
COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY src ./src
COPY public ./public

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Explicitly copy node_modules and then application files from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"] 