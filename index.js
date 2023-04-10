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

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name: "תשעה מיליון אנשים",
    type: ActivityType.Watching,
  });

  setInterval(async () => {
    let etag;
    await fetch("https://www.oref.org.il/WarningMessages/alert/alerts.json", {
      method: "GET",
      headers: {
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-US,en;q=0.5",
        Connection: "keep-alive",
        "Content-Type": "application/json;charset=utf-8",
        "If-Modified-Since": etag ? new Date().toUTCString() : undefined,
        "If-None-Match": etag ? etag : undefined,
        Referer: "https://www.oref.org.il//12481-he/Pakar.aspx",
        "sec-ch-ua":
          '"Chromium";v="112", "Brave";v="112", "Not:A-Brand";v="99"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "Sec-GPC": "1",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
        "X-Requested-With": "XMLHttpRequest",
      },
    })
      .then((result) => {
        etag = result.headers.get("etag");
        return result.status === 304
          ? undefined
          : (async () => {
              const text = await result.text()[0];
              try {
                return JSON.parse(text);
              } catch (error) {
                return undefined;
              }
            })();
      })
      .then((alert) => {
        if (alert !== undefined) {
          let shit = fs.readFileSync("./errorsandsomeshit.txt", {
            encoding: "utf8",
          });

          shit += alert;

          fs.writeFileSync("./errorsandsomeshit.txt", shit, "utf8");
          const json = JSON.parse(
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
                .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
                .setAuthor({
                  name: "פיקוד העורף",
                  iconURL:
                    "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png",
                  url: "https://www.oref.org.il//12481-he/Pakar.aspx",
                })
                .setDescription(alert.category_desc)
                .addFields(
                  {
                    name: `התרעה של פיקוד העורף בשעה${alert.time}`,
                    value: "",
                  },
                  { name: "\u200B", value: "\u200B" }
                );
              channel.send({ embeds: [embed] });
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
      });
  }, 2000);
});

client.on(Events.InteractionCreate, async (interaction) =>
  registerCommands(interaction)
);

client.login(process.env.DISCORD_TOKEN);
