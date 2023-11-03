require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { registerCommands, registerButtons } = require("./reg.js");
const { wsConnect } = require("./alertHandler.js");

const channelServer = path.join(__dirname, "channelServer.json");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name: process.env.STATUS,
    type: parseInt(process.env.STATUS_CATEGORY),
  });

  const json = JSON.parse(
    fs.readFileSync(channelServer, {
      encoding: "utf8",
    })
  );

  // Checking for any servers that were left
  for (let server in json) {
    if (!client.guilds.cache.has(server)) {
      delete json[server];

      let newData = JSON.stringify(json);
      fs.writeFileSync(channelServer, newData, "utf8");
    }
  }

  wsConnect();
});

// Interactions
client.on(Events.InteractionCreate, async (interaction) => {
  registerButtons(interaction);
  registerCommands(interaction);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = client;
