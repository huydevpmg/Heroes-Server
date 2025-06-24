# Chọn Node.js phiên bản 20
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g nodemon

COPY . .

EXPOSE 4000

CMD ["nodemon", "src/server.js"]