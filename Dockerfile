
FROM node:22
WORKDIR /app

# ติดตั้ง dependencies แบบ reproducible
COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 10345

RUN npm run build

CMD ["npm", "run", "start"]

# ใส่ entrypoint (เราจะปรับเป็น production mode ในขั้นตอนถัดไป)
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]