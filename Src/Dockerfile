# NOTE: This dockerfile is designed to be run in the context of the Src directory of this application.

FROM node:14

WORKDIR /user/src/app
COPY package*.json ./
RUN npm install

COPY . .

RUN npm install bower -g

RUN bower install --allow-root

ENTRYPOINT ["node", "server.js"]
