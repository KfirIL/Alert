# Use a Node.js base image
FROM node:latest

# Set the working directory to /app
WORKDIR /app

# Updating and downloading crontab
RUN apt-get update && apt-get install -y cron

# Make the script executable
RUN chmod +x /app/github_update.sh

# Set up a cron job to check for updates every 10 minutes
RUN crontab -l | { cat; echo "*/60 * * * * /app/github_update.sh"; } | crontab -

# Start the app
CMD ["bash", "-c", "npm install && node ."]
