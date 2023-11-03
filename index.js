require("dotenv").config();
require("./globals.js");
const main = require("./mongoose.js");
const { Client, GatewayIntentBits, Events } = require("discord.js");
const { registerCommands, registerButtons } = require("./reg.js");
const { wsConnect } = require("./alertHandler.js");

client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on("ready", async () => {
  client.user.setActivity({
    name: process.env.STATUS,
    type: parseInt(process.env.STATUS_CATEGORY),
  });
  console.log(
    `Logged in as ${client.user.tag} with status ${process.env.STATUS} ${process.env.PASS}!`
  );

  await main();
  const servers = await collection.find({}).toArray();

  // Checking for any servers that were left
  servers.forEach((server) => {
    if (!client.guilds.cache.has(server._id)) {
      collection.deleteOne({ _id: server._id });
    }
  });

  wsConnect();
});

// Interactions
client.on(Events.InteractionCreate, async (interaction) => {
  registerButtons(interaction);
  registerCommands(interaction);
});

client.login(process.env.DISCORD_TOKEN);
