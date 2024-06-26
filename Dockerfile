FROM node:21-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY jest.config.js ./ 
RUN npm ci

COPY src src
RUN npm run build 

COPY templates templates
COPY emailTemplates emailTemplates
EXPOSE 3000
CMD [ "node", "./dist/bin/www.js" ]
