FROM node:17-alpine3.15 as be-development

EXPOSE 3000

RUN  mkdir /home/node/app
WORKDIR /home/node/app

COPY backend .

RUN yarn install && yarn build

FROM node:17-alpine3.15 as be-prod

EXPOSE 3000

RUN apk add --update curl && \
  rm -rf /var/cache/apk/*

COPY --from=be-development /home/node/app/delay.sh /home/node/app/delay.sh
RUN chmod +X /home/node/app/delay.sh

COPY --from=be-development /home/node/app/node_modules /home/node/app/node_modules
COPY --from=be-development /home/node/app/dist /home/node/app/
