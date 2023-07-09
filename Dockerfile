FROM node:18-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./ 

RUN npm install

COPY src src
RUN npm run build 

EXPOSE 3000
CMD [ "node", "./dist/bin/www.js" ]
