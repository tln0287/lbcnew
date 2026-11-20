# Builds the site, then runs the API server, which also serves the built site.

FROM node:24-alpine AS site
WORKDIR /app/site
COPY site/package.json site/package-lock.json ./
RUN npm ci
COPY site/ ./
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/src ./src
COPY server/migrations ./migrations
# the server imports the form rules shared with the site
COPY site/package.json /app/site/package.json
COPY site/src/lib/application.ts /app/site/src/lib/application.ts
COPY --from=site /app/site/dist /app/site/dist
USER node
EXPOSE 8787
CMD ["node", "src/index.ts"]
