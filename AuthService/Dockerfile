# Chọn Node.js phiên bản 20
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Mở port (tuỳ app bạn chạy cổng nào)
EXPOSE 4000

CMD ["node", "src/server.js"]