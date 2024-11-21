FROM node:22-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY src ./src

RUN npm run build


FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/app.js"]