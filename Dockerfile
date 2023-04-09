# Use a Node.js base image
FROM node:latest

# Setting a workdir
WORKDIR /app

# Start the app
CMD ["bash", "-c", "git config --global credential.helper store && git credential-store --file /app/.git-credentials store && git pull && npm install && node ."]