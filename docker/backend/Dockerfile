FROM node:17-alpine3.15 as be-development

EXPOSE 3000

RUN  mkdir /home/node/app
WORKDIR /home/node/app

COPY backend .

RUN yarn install && yarn build
