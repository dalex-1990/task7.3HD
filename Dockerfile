FROM node:16

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install

# Copy New Relic config (if you have it)
COPY newrelic.js ./

# Bundle app source
COPY . .

# Expose port for the app
EXPOSE 5000

# Start the application
CMD ["npm", "start"]