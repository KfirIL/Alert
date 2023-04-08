#!/bin/bash

# navigate to the directory where the Github repo is located
cd /home/pi/Alert

# check for any changes on the remote repository
git fetch

# compare the local and remote repository
if [[ $(git rev-parse HEAD) != $(git rev-parse @{u}) ]]; then
  # pull any changes
  git pull
  
  # restart the Docker container
  docker restart bot
fi