# Dockerfile for running the Udia graphql serverless api

# Base stage is Amazon Linux
FROM amazonlinux:latest as opsys
WORKDIR /opt/app

# Install necessary system dependencies
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install gcc gcc-c++ make nodejs -y

# Build NodeJS (takes a terribly long time)
# RUN curl https://nodejs.org/dist/v8.10.0/node-v8.10.0.tar.gz \
#   --silent --show-error --output node-v8.10.0.tar.gz
# RUN tar -xzf node-v8.10.0.tar.gz && \
#   cd node-v8.10.0 && ./configure && make && make install

# Copy the application source into the docker container
COPY . .
RUN npm install -g node-gyp
RUN npm install

# Rebuild required native libraries
RUN cd /opt/app/node_modules/argon2 && CXX=gcc node-gyp rebuild
RUN cd /opt/app/node_modules/bufferutil && CXX=gcc node-gyp rebuild
RUN cd /opt/app/node_modules/utf-8-validate && CXX=gcc node-gyp rebuild

# Run the application
WORKDIR /opt/app
EXPOSE 3000
CMD [ "npm", "start" ]
