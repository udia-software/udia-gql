# udia-gql
[![CircleCI](https://circleci.com/gh/udia-software/udia-gql.svg?style=svg)](https://circleci.com/gh/udia-software/udia-gql)
[![codecov](https://codecov.io/gh/udia-software/udia-gql/branch/master/graph/badge.svg)](https://codecov.io/gh/udia-software/udia-gql)

GraphQL Backend for Udia serverless application.

## Quickstart

```bash
npm install
# start local Amazon DynamoDb instance
docker run -d -p 8000:8000 amazon/dynamodb-local
# initialize all tables
npm run load_dev_db
npm start -- --stage dev
```

## Deployment

Deployment to AWS Lambda is non-trivial due to the reliance on `argon2`, a native library bound using node-gyp, and other issues.
It is necessary to build and deploy the application from Amazon Linux.

```bash
docker build -t udia/amazon_linux .
# ensure dynamodb container is stopped, as serverless requires port 8000
docker run -it -p 8000:8000 -v $HOME/.aws:/root/.aws udia/amazon_linux /bin/bash
# within the container environment
npx serverless login
# follow serverless instructions
npm run deploy -- --stage prod
```

## LICENSE

[Apache-2.0](LICENSE)
