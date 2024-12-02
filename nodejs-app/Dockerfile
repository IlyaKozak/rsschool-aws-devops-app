FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY src ./src
COPY tsconfig.json ./

RUN npm run build


FROM node:22-slim

USER node
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]