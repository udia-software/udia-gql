# Dockerfile for running the Udia graphql serverless api

# Use Node LTS
FROM node:10

# Create the application directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install the application dependencies
# Wildcard ensures both package.json & package-lock.json are copied
RUN npm install -g node-gyp
COPY . ./
RUN npm install

# Bundle the application source
EXPOSE 3000
CMD [ "npm", "start" ]
