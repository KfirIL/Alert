const fs = require("fs");

// Create log.txt if it doesn't exist
if (!fs.existsSync("log.txt")) {
  fs.writeFileSync("log.txt", "", "utf8");
  console.log("log.txt created.");
} else {
  console.log("log.txt already exists.");
}

// Create .env with default variables
const envContent = `\
PASS=<MonoDBPass>
DB=<MonoDB>
COL=<MonoDBCollection>

DISCORD_TOKEN=<The discord bot TOKEN>
CLIENT_ID=<The Discord bot client id>
STATUS=<Text status>
STATUS_CATEGORY=<Type in number> 

#  * STATUS_CATEGORY reference:
#  * 0 - Playing
#  * 1 - Streaming
#  * 2 - Listening
#  * 3 - Watching
#  * 4 - Custom (emoji + details)
#  * 5 - Competing
`;

if (!fs.existsSync(".env")) {
  fs.writeFileSync(".env", envContent, "utf8");
  console.log(".env created with default content.");
} else {
  console.log(".env already exists.");
}
