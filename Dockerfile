FROM node:20.16.0

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV NODE_ENV=production
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
