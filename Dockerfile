FROM node:lts-alpine

WORKDIR /usr/src/app
COPY package*.json ./

RUN npm ci --only=production
RUN npm run build 
COPY dist .

EXPOSE 3000
CMD [ "node", "./bin/www.js" ]
