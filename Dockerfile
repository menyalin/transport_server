FROM node:lts

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci --only=production

COPY src src
RUN npm run build 

EXPOSE 3000
CMD [ "node", "./dist/bin/www.js" ]
