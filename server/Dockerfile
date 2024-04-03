FROM node:20.10.0-slim

WORKDIR /usr/app

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["./node_modules/.bin/tsx", "server.ts"]
