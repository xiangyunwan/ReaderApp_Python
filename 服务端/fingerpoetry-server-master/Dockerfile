FROM node:6.3.0

WORKDIR /usr/src/app

COPY package.json ./package.json
RUN npm --registry=https://registry.npm.taobao.org install && rm -rf /tmp/npm-*
COPY . ./

ENV NODE_ENV=production
ENV BIND_HOST=:: BIND_PORT=6000

ENTRYPOINT [ "bin/docker-entrypoint.sh", "npm", "start"  ]
EXPOSE 6000
EXPOSE 3000
