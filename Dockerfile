FROM node:22-alpine
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps --include=dev
RUN npm run build -w apps/api
CMD ["npm", "run", "start", "--workspace=apps/api"]
