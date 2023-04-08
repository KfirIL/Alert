# Use a Node.js base image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Updating and downloading crontab
RUN apt-get update && apt-get install -y cron

# Start the app
CMD ["/bin/bash", "npm install && node . && chmod +x github_update.sh && crontab -l | { cat; echo "*/1 * * * * /app/github_update.sh"; } | crontab -"]