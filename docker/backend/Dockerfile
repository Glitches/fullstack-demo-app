FROM node:17-alpine3.15 as be-build

RUN  mkdir /home/node
WORKDIR /home/node

COPY backend .

RUN yarn install && yarn build

FROM node:17-alpine3.15 as be-prod

EXPOSE 3000

RUN apk add --update curl && \
  rm -rf /var/cache/apk/*

COPY --from=be-build /home/node/delay.sh /home/node/delay.sh
RUN chmod +X /home/node/delay.sh

COPY --from=be-build /home/node/node_modules /home/node/node_modules
COPY --from=be-build /home/node/dist /home/node/
