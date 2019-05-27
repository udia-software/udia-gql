# udia-gql
[![CircleCI](https://circleci.com/gh/udia-software/udia-gql.svg?style=svg)](https://circleci.com/gh/udia-software/udia-gql)

GraphQL Backend for Udia serverless application.

```bash
docker pull amazon/dynamodb-local
# local dynamodb
docker run -p 8000:8000 amazon/dynamodb-local
# new terminal, initialize tables
./init_local_dynamodb.sh
npm start -- --stage dev
```

## Deployment

Deployment to AWS Lambda is non-trivial due to the reliance on `argon2`, a native library bound using node-gyp, and other issues.
It is necessary to build and deploy the application from Amazon Linux.

TODO: automate this PITA better

```bash
docker pull amazonlinux
# run amazonlinux interactively
docker run -it -v $PWD:/opt/app -v $HOME/.aws:/root/.aws -w /opt/app amazonlinux /bin/bash

# install required packages
yum install tar gzip gcc gcc-c++ make -y
# install node version manager
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.34.0/install.sh | bash
# load nvm
. ~/.nvm/nvm.sh
# install node
# nvm install v10 https://github.com/apollographql/apollo-server/issues/2705
nvm install v8.10
# clear existing node_modules and .build
rm -rf node_modules .build
npm install -g node-gyp
npm install
# handle all the special case native libraries
cd /opt/app/node_modules/argon2
CXX=gcc node-gyp rebuild
cd /opt/app/node_modules/bufferutil
CXX=gcc node-gyp rebuild
cd /opt/app/node_modules/utf-8-validate
CXX=gcc node-gyp rebuild
cd /opt/app

# deploy serverless code bundle (probably don't need to minify server code)
npm run deploy -- --stage prod
# cleanup
rm -rf node_modules .build .serverless
```

## LICENSE

[Apache-2.0](LICENSE)
