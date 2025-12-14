# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# 先複製 package 檔案以利快取
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./

# 依照你使用的套件管理器安裝
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# 複製專案原始碼
COPY . .

# 建置 Vite
RUN npm run build

# ---------- Runtime stage ----------
FROM nginx:1.27-alpine

# 移除預設設定
RUN rm /etc/nginx/conf.d/default.conf

# 自訂 nginx 設定（支援 SPA routing）
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 複製 build 結果
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]