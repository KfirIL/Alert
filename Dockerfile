# Use a Node.js base image
FROM node:latest

# Setting a workdir
WORKDIR /app

# Start the app
CMD ["bash", "-c", "git pull && npm install && node ."]