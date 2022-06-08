# Creo il dockerfile che fa la build per produzione
FROM node:17-alpine3.15 as fe-build

RUN  mkdir /home/node
WORKDIR /home/node

COPY frontend /home/node

RUN yarn install && yarn build

FROM nginx:1.21.6-alpine as fe-production

COPY --from=fe-build /home/node/dist /usr/share/nginx/html

