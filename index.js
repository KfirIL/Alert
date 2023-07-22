require("dotenv").config();

const fs = require("node:fs");
const { registerCommands, registerButtons } = require("./reg.js");
const WebSocket = require("ws");
const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il:8443/socket?platform=WEB";

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  PermissionsBitField,
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

  const versionR = await fetch("https://api.tzevaadom.co.il/lists-versions");
  const versionJson = await versionR.json();
  const version = versionJson.cities;

  fetch("https://www.tzevaadom.co.il/static/cities.json?v=" + version)
    .then((response) => response.json())
    .then((data) => {
      fs.writeFileSync("cities.json", JSON.stringify(data), "utf8");
    });

  let json = JSON.parse(
    fs.readFileSync("channelServer.json", {
      encoding: "utf8",
    })
  );

  const jsonCities = JSON.parse(
    fs.readFileSync("cities.json", {
      encoding: "utf8",
    })
  );

  const cities = jsonCities.cities;
  const areas = jsonCities.areas;
  const countdown = jsonCities.countdown;

  for (let server in json) {
    if (!client.guilds.cache.has(server)) {
      delete json[server];

      let newData = JSON.stringify(json);
      fs.writeFileSync("channelServer.json", newData, "utf8");
    }
  }

  let ws = new WebSocket(WEBSOCKET_URL, {
    headers: {
      origin: "https://www.tzevaadom.co.il",
    },
  });

  ws.onopen = (e) => {
    console.log("ws connected");
  };
  ws.onclose = (e) => {
    let text = fs.readFileSync("errorsandsomeshit.txt", {
      encoding: "utf8",
    });
    text += `\n${JSON.stringify(e)}`;
    fs.writeFileSync("errorsandsomeshit.txt", text, "utf8");
    console.log(`\n\n\nClosed: ${JSON.stringify(e)}`);
    // process.exit();
  };
  ws.onerror = (e) => {
    let text = fs.readFileSync("errorsandsomeshit.txt", {
      encoding: "utf8",
    });
    text += JSON.stringify(e);
    fs.writeFileSync("errorsandsomeshit.txt", text, "utf8");
    console.log(`Error: ${JSON.stringify(e)}`);
  };

  ws.onmessage = async (m) => {
    if (typeof m.data != "string") return;
    const { type, data } = JSON.parse(m.data);
    console.log(type);
    console.log(data);
    if (type !== "ALERT") return;
    if (data.threat !== 0) return;
    const alert = data;
    let text = fs.readFileSync("errorsandsomeshit.txt", {
      encoding: "utf8",
    });
    text += `\n${JSON.stringify(alert)}`;
    fs.writeFileSync("errorsandsomeshit.txt", text, "utf8");

    json = JSON.parse(
      fs.readFileSync("channelServer.json", {
        encoding: "utf8",
      })
    );

    const embed = new EmbedBuilder()
      .setColor("#f39a20")
      .setTitle("ירי טילים ורקטות")
      .setDescription("היכנסו למרחב המוגן ושהו בו 10 דקות")
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
          name: "אזור בארץ:",
          value: areas[cities[alert.cities[0]].area]["he"],
        },
        { name: "\u200B", value: "\u200B" }
      )
      .setFooter({
        text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
      })
      .setTimestamp(new Date(alert.time * 1000));

    for (let city in alert.cities) {
      const cityCountDown = cities[alert.cities[city]].countdown;

      embed.addFields({
        name: alert.cities[city],
        value: `זמן כניסה למ"מ: ${countdown[cityCountDown]["he"]}`,
        inline: true,
      });
    }
    embed.addFields({ name: "\u200B", value: "\u200B" });

    for (let server in json) {
      const channel = client.guild.channels.cache.has(json[server].channel)
        ? client.guild.channels.cache.get(json[server].channel)
        : undefined;

      if (client == undefined) return;
      else if (
        !channel
          .permissionsFor(interaction.guild.members.me)
          .has(PermissionsBitField.Flags.SendMessages)
      )
        return;

      channel.send({
        embeds: [embed],
        content: client.guilds.cache
          .get(server)
          .roles.cache.has(json[server].role)
          ? client.guilds.cache.get(server).roles.cache.get(json[server].role)
              .name !== "@everyone"
            ? `<@&${json[server].role}>`
            : "@everyone"
          : undefined,
      });
    }
  };
});

client.on(Events.InteractionCreate, async (interaction) => {
  registerButtons(interaction);
  registerCommands(interaction);
});

client.login(process.env.DISCORD_TOKEN);
