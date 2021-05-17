# NOTE: This dockerfile is designed to be run in the context of the src directory of this application.
FROM node:14 AS rover-interview-project-build

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

RUN npx mkdirp dist

COPY tsconfig**.json webpack.config.js ./
COPY ./src/ ./src/
RUN npm run build:server
#RUN npx tsc -p ./tsconfig.server.json
#RUN npx copyfiles -u 1 ./src/api-definition.yaml dist

#RUN npm run build:client
#RUN npx webpack --config webpack.config.js

FROM node:14 AS rover-interview-project
WORKDIR /usr/src/app

COPY ./src/api-definition.yaml ./
COPY ./src/data/ ./data/
COPY --from=rover-interview-project-build /usr/src/app/dist /usr/src/app/package*.json ./

RUN npm install --production

#ENTRYPOINT [ "node", "-e", "setTimeout(() => { console.log('done'); }, (5 * 60 * 1000));" ]
ENTRYPOINT ["node", "/usr/src/app/server/server.js"]
