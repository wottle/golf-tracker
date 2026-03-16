FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server ./server
COPY client/package*.json ./client/
RUN cd client && npm install

COPY client ./client
RUN cd client && npm run build

RUN mkdir -p uploads/scorecards uploads/photos

EXPOSE 3001

CMD ["npm", "start"]
