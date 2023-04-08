# Use a Node.js base image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Start the bot
CMD ["bash", "-c", "npm install && node ."]