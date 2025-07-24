FROM node:20-slim

WORKDIR /app

COPY package*.json ./

RUN npm install && npm install -g nodemon

COPY . .

EXPOSE 8080

CMD ["nodemon", "src/server.js"]