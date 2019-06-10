# Dockerfile for running the Udia graphql serverless api

# Base stage is Amazon Linux
FROM amazonlinux:latest as opsys
WORKDIR /opt/app

# Install necessary system dependencies
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install util-linux gcc gcc-c++ make nodejs -y

# Build NodeJS (takes a terribly long time)
# RUN curl https://nodejs.org/dist/v8.10.0/node-v8.10.0.tar.gz \
#   --silent --show-error --output node-v8.10.0.tar.gz
# RUN tar -xzf node-v8.10.0.tar.gz && \
#   cd node-v8.10.0 && ./configure && make && make install

RUN npm install -g node-gyp
# Rebuild required native libraries
RUN npm install argon2@^0.23.0 --no-save && cd /opt/app/node_modules/argon2 && CXX=gcc node-gyp rebuild
RUN npm install bufferutil@^4.0.1 --no-save && cd /opt/app/node_modules/bufferutil && CXX=gcc node-gyp rebuild
RUN npm install utf-8-validate@^5.0.2 --no-save && cd /opt/app/node_modules/utf-8-validate && CXX=gcc node-gyp rebuild

# Copy the application source into the docker container
WORKDIR /opt/app
COPY . .
RUN npm install

# Run the application
EXPOSE 3000
CMD [ "npm", "start" ]
