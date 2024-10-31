FROM node:20.16.0

WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
