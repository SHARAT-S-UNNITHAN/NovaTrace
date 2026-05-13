FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5173

# Using a simple server to serve Vite build in dev mode for demo, 
# or we could use nginx for production.
CMD ["npm", "run", "dev", "--", "--host"]
