FROM node:24
WORKDIR /app
COPY package*.json /app
RUN npm install
COPY . /app
ENV PORT=80
ENV DB_USER=postgres
ENV DB_HOST=child-and-me-db
ENV DB_NAME=child_and_me
ENV DB_PASSWORD=docker
ENV DB_PORT=5432
ENV JWT_SECRET=change-me-in-production
EXPOSE 80
CMD ["node", "index.js"]
