# Creo il dockerfile che fa la build per produzione
FROM node:17-alpine3.15 as fe-development
RUN  mkdir /home/node/app
WORKDIR /home/node/app
COPY frontend /home/node/app
RUN yarn build


FROM nginx:1.21.6-alpine as fe-production
COPY --from=fe-development /home/node/app/dist /usr/share/nginx/html

