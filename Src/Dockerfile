# NOTE: This dockerfile is designed to be run in the context of the src directory of this application.

FROM node:14 AS rover-interview-project-build

WORKDIR /user/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npx webpack --config webpack.config.js

FROM node:14 AS rover-interview-project
WORKDIR /user/src/app

COPY --from=rover-interview-project-build ./user/src/app/dist/. ./dist/
COPY --from=rover-interview-project-build ./user/src/app/api-definition.yaml ./
COPY --from=rover-interview-project-build ./user/src/app/client/. ./client/
COPY --from=rover-interview-project-build ./user/src/app/data/. ./data/

ENTRYPOINT ["node", "./server.js"]
