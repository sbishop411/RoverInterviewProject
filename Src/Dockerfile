# NOTE: This dockerfile is designed to be run in the context of the src directory of this application.

FROM node:14

WORKDIR /user/src/app
COPY package*.json ./
RUN npm install

COPY bower.json ./
COPY .bowerrc ./

RUN npm install bower -g

RUN bower install --allow-root

COPY . .

ENTRYPOINT ["node", "server.js"]
