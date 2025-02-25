FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads
EXPOSE 3001
VOLUME /app/uploads
CMD ["node", "server.js"]
