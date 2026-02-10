FROM public.ecr.aws/lambda/nodejs:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build
RUN npm prune --production

FROM public.ecr.aws/lambda/nodejs:20

WORKDIR ${LAMBDA_TASK_ROOT}

# ✅ COPY COMPILED OUTPUT (THIS WAS MISSING)
COPY --from=build /app/dist ${LAMBDA_TASK_ROOT}/dist

# seed data (fine)
COPY --from=build /app/src/seed/data ${LAMBDA_TASK_ROOT}/src/seed/data

# dependencies
COPY --from=build /app/node_modules ${LAMBDA_TASK_ROOT}/node_modules

ENV NODE_ENV=production

CMD ["dist/index.handler"]
