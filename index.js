require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setStatus("dnd");

  setInterval(async () => {
    await fetch(
      "https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?lang=he&mode=1"
    )
      .then((result) => result.json())
      .then((data) => {
        fs.readFile("channelServer.json", "utf8", (err, res) => {
          if (err) {
            console.error(err);
            return;
          }
          const json = JSON.parse(res);

          for (let server in json) {
            if (client.channels.cache.has(json[server].channel)) {
              let channel = client.channels.cache.get(json[server].channel);

              data.forEach((alert) => {
                const timeString = alert.time;
                const [hours, minutes, seconds] = timeString.split(":");

                // Parse the date string and extract day, month, and year
                const dateString = alert.date;
                const [day, month, year] = dateString.split(".");

                // Create a new Date object with the extracted values
                const givenDate = new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  seconds
                );
                const currentDate = new Date();
                if (Math.abs(currentDate - givenDate) <= 4000) {
                  const embed = new EmbedBuilder()
                    .setColor("#e8793f")
                    .setTitle(`התרעת פיקוד העורף ב–${alert.data}`)
                    .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
                    .setAuthor({
                      name: "פיקוד העורף",
                      iconURL:
                        "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png",
                      url: "https://www.oref.org.il//12481-he/Pakar.aspx",
                    })
                    .setDescription(alert.category_desc)
                    .addFields({
                      name: `התרעה של פיקוד העורף בשעה–${alert.time}`,
                      value: alert.date,
                    });
                  channel.send({ embeds: [embed] });
                }
              });
            }
          }
        });
      });
  }, 2000);
});

client.commands = new Map();
const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "לא יכלנו לבצע את הפקודה! דווח על זה בבקשה בשרת הדיסקורד שלנו",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "לא יכלנו לבצע את הפקודה! דווח על זה בבקשה בשרת הדיסקורד שלנו",
        ephemeral: true,
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
