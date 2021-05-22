# NOTE: This dockerfile is designed to be run in the context of the root directory of this repo.
FROM node:14 AS rover-interview-project-build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

RUN npx mkdirp dist

COPY tsconfig**.json webpack.config.js ./
COPY ./src/ ./src/
RUN npm run build:server

#RUN npm run build:client
#RUN npx webpack --config webpack.config.js

FROM node:14 AS rover-interview-project
WORKDIR /usr/src/app

COPY --from=rover-interview-project-build /usr/src/app/package*.json ./
RUN npm install --production

COPY ./src/api-definition.yaml ./
COPY ./src/data/ ./data/
COPY --from=rover-interview-project-build /usr/src/app/dist ./

ENTRYPOINT ["node", "/usr/src/app/server/server.js"]
