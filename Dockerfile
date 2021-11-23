FROM bitnami/node:14 as build
COPY . /app

WORKDIR /app
RUN npm install
RUN npm run build

WORKDIR /app/server
RUN npm install


FROM bitnami/node:14-prod

COPY --from=build /app/build /app/build
COPY --from=build /app/server /app/server

RUN useradd -r -u 1001 -g root nonroot
RUN chown -R nonroot /app
USER nonroot

WORKDIR /app/server
EXPOSE 3001

# Start the application
CMD ["node", "server.js"]