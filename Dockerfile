# ----------- PHASE 1: Builder -----------
    FROM node:20-alpine AS builder

    WORKDIR /app
    
    COPY package*.json ./
    RUN npm install --force
    
    COPY . .
    COPY .env.local .env.local
    
    RUN npm run build
    
    # Sửa port cứng 3000 trong server.js thành lấy từ ENV
    RUN sed -i 's/server\.listen(3000)/server.listen(process.env.PORT || 3000)/' .next/standalone/server.js
    
    # ----------- PHASE 2: Runner -----------
    FROM node:20-alpine AS runner
    
    WORKDIR /app
    
    ENV NODE_ENV=production
    ENV PORT=3600
    
    COPY --from=builder /app/.next/standalone ./
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    COPY --from=builder /app/.env.local .env.local
    
    EXPOSE 3600
    
    CMD ["node", "server.js"]