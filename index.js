require("dotenv").config();

const fs = require("node:fs");
const { registerCommands } = require("./reg.js");

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  ActivityType,
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

client.on(
  "ready",
  async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setActivity({
      name: `תשעה מיליון איש`,
      type: ActivityType.Watching,
    });

    setInterval(async () => {
      await fetch(
        "https://www.oref.org.il//Shared/Ajax/GetAlarmsHistory.aspx?lang=he&mode=1"
      )
        .then((result) => result.json())
        .then((data) => {
          const json = JSON.parse(
            fs.readFileSync("channelServer.json", {
              encoding: "utf8",
            })
          );

          data.forEach((alert) => {
            const timeString = alert.time;
            const [hours, minutes, seconds] = timeString.split(":");

            const dateString = alert.date;
            const [day, month, year] = dateString.split(".");

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
              for (let server in json) {
                if (client.channels.cache.has(json[server].channel)) {
                  let channel = client.channels.cache.get(json[server].channel);
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
              }
            }
          });
        });
    });
  },
  2000
);

client.on(Events.InteractionCreate, async (interaction) =>
  registerCommands(interaction)
);

client.login(process.env.DISCORD_TOKEN);
