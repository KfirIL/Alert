# Use a Node.js base image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Updating and downloading crontab
RUN apt-get update && apt-get install -y cron

# Copying the github update script
COPY github_update.sh /app

# Make the script executable
RUN chmod +x github_update.sh

# Set up a cron job to check for updates every minute
RUN crontab -l | { cat; echo "*/1 * * * * /app/github_update.sh"; } | crontab -

# Start the app
CMD ["bash", "-c", "npm install && node ."]
