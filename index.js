require("dotenv").config();

const fs = require("node:fs");
const { registerCommands, registerButtons } = require("./reg.js");

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

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name: process.env.STATUS,
    type: parseInt(process.env.STATUS_CATEGORY),
  });

  let json = JSON.parse(
    fs.readFileSync("channelServer.json", {
      encoding: "utf8",
    })
  );

  for (let server in json) {
    if (!client.guilds.cache.has(server)) {
      delete json[server];

      let newData = JSON.stringify(json);
      fs.writeFileSync("channelServer.json", newData, "utf8");
    }
  }

  setInterval(
    async () =>
      await fetch("https://www.oref.org.il/WarningMessages/alert/alerts.json", {
        method: "GET",
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json;charset=utf-8",
          Referer: "https://www.oref.org.il//12481-he/Pakar.aspx",
        },
      })
        .then(async (result) => {
          const text = await result.text()[0];
          try {
            return JSON.parse(text);
          } catch (error) {
            return undefined;
          }
        })
        .then((alert) => {
          if (alert !== undefined) {
            let shit = fs.readFileSync("./errorsandsomeshit.txt", {
              encoding: "utf8",
            });
            shit += alert;
            fs.writeFileSync("./errorsandsomeshit.txt", shit, "utf8");

            let json = JSON.parse(
              fs.readFileSync("channelServer.json", {
                encoding: "utf8",
              })
            );

            for (let server in json) {
              if (client.channels.cache.has(json[server].channel)) {
                let channel = client.channels.cache.get(json[server].channel);
                const embed = new EmbedBuilder()
                  .setColor("#e8793f")
                  .setTitle(`התרעת פיקוד העורף ב${alert.data}`)
                  .setDescription(alert.category_desc)
                  .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
                  .setAuthor({
                    name: "פיקוד העורף",
                    iconURL:
                      "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png",
                    url: "https://www.oref.org.il//12481-he/Pakar.aspx",
                  })
                  .setThumbnail(
                    "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png"
                  )
                  .addFields(
                    {
                      name: `התרעה של פיקוד העורף בשעה ${alert.time}`,
                      value: "נא לפעול לפי הנחיות פיקוד העורף",
                    },
                    { name: "\u200B", value: "\u200B" }
                  )
                  .setFooter({
                    text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. לשם קבלת התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
                  })
                  .setTimestamp(new Date(alert.alertDate));
                channel.send({
                  embeds: [embed],
                  content: client.guilds.cache
                    .get(server)
                    .roles.cache.has(json[server].role)
                    ? client.guilds.cache
                        .get(server)
                        .roles.cache.get(json[server].role).name !== "@everyone"
                      ? `<@&${json[server].role}>`
                      : "@everyone"
                    : undefined,
                });
              }
            }
          }
        })
        .catch((error) => {
          let shit = fs.readFileSync("./errorsandsomeshit.txt", {
            encoding: "utf8",
          });

          shit += error;

          fs.writeFileSync("./errorsandsomeshit.txt", shit, "utf8");

          console.log(error);
        }),
    2000 // Interval Miliseconds
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  registerButtons(interaction);
  registerCommands(interaction);
});

client.login(process.env.DISCORD_TOKEN);
