# Use a Node.js base image
FROM node:latest

# Updating and downloading crontab
RUN apt-get update && apt-get install -y cron

COPY github_update.sh /home

# Make the script executable
RUN chmod +x /home/github_update.sh

# Set up a cron job to check for updates every 10 minutes
RUN crontab -l | { cat; echo "*/1 * * * * /home/github_update.sh"; } | crontab -

WORKDIR /app
# Start the app
CMD ["bash", "-c", "npm install && node ."]