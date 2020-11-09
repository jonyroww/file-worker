FROM node:12-slim AS installer
WORKDIR /usr/src/app

COPY package.json package-lock.json ./
ENV NODE_ENV development
RUN npm install

COPY src ./src

ENV NODE_ENV production
RUN npm run build
RUN npm install

ENV PORT 80
ENV HOST 0.0.0.0

EXPOSE 80

ENV NODE_ENV production
CMD cd src/DB && npx sequelize-cli db:migrate && cd ../.. &&  node dist/app.js