FROM public.ecr.aws/lambda/nodejs:22

COPY index.js ${LAMBDA_TASK_ROOT}
COPY package.json ${LAMBDA_TASK_ROOT}

RUN npm install

CMD [ "index.handler" ]

