# syntax=docker/dockerfile:1
# ภาพ Docker สำหรับติดตั้งบนเซิร์ฟเวอร์ภายใน (ดู README → "Deploy บนเซิร์ฟเวอร์ภายใน")
# build: ติดตั้ง dependency ทั้งหมด + next build | run: เฉพาะ dependency ที่ใช้ตอนรัน
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.ts ./
EXPOSE 3400
CMD ["npm", "run", "start"]
