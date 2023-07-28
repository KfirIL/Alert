const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("node:fs");
const WebSocket = require("ws");

const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il:8443/socket?platform=WEB";

function writeToErrorsAndDataFile(data) {
  let text = fs.readFileSync("errorsandsomeshit.txt", {
    encoding: "utf8",
  });
  text += `\n${JSON.stringify(data)}`;
  fs.writeFileSync("errorsandsomeshit.txt", text, "utf8");
}

async function fetchCitiesData() {
  const versionR = await fetch("https://api.tzevaadom.co.il/lists-versions");
  const versionJson = await versionR.json();
  const version = versionJson.cities;

  const response = await fetch(
    "https://www.tzevaadom.co.il/static/cities.json?v=" + version
  );
  return response.json();
}

async function onAlert(client, m, cities, areas, countdown) {
  if (typeof m.data != "string") return;
  const { type, data: alert } = JSON.parse(m.data);
  if (type !== "ALERT") return;
  if (data.threat !== 0 && data.threat !== 2) return;
  writeToErrorsAndDataFile(alert);
  console.log(JSON.stringify(alert));

  // Reloading json file.
  const json = JSON.parse(
    fs.readFileSync("channelServer.json", {
      encoding: "utf8",
    })
  );

  const title =
    threat === 0
      ? "ירי טילים ורקטות"
      : threat === 2
      ? "חשש לחדירת מחבל"
      : undefined;

  const embed = new EmbedBuilder()
    .setColor("#ff3d00")
    .setTitle(title)
    .setDescription("היכנסו למרחב המוגן ושהו בו 10 דקות")
    .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
    .setAuthor({
      name: "מנהל ההתרעות של ישראל",
    })
    .setThumbnail(
      "https://cdn.discordapp.com/attachments/1041017624299048981/1132264780481187860/Alert-Logo.png"
    )
    .addFields(
      {
        name: "אזור בארץ:",
        value: areas[cities[alert.cities[0]].area]["he"],
      },
      { name: "\u200B", value: "\u200B" },
      {
        name: "יישובים:",
        value: "​", // Whitespace character
      }
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
}

function createWebSocket() {
  return new WebSocket(WEBSOCKET_URL, {
    headers: {
      origin: "https://www.tzevaadom.co.il",
    },
  });
}

async function wsConnect(client) {
  const citiesData = await fetchCitiesData();
  let ws = createWebSocket();

  let isReconnecting = false;
  const handleReconnect = () => {
    ws.close(); // In case of an error.
    if (isReconnecting) return; // Sometimes it will close a couple of times.
    isReconnecting = true;
    //console.log("Trying to reconnect...");

    setTimeout(wsConnect, 5000); // Actual Reconnect.
  };

  ws.onopen = () => {
    //console.log("WebSocket connected");
  };
  ws.onclose = () => {
    //console.log("WebSocket Closed");
    handleReconnect();
  };
  ws.onerror = (e) => {
    writeToErrorsAndDataFile(e);
    //console.log(`Error: ${JSON.stringify(e)}`);
    handleReconnect();
  };

  ws.onmessage = (m) =>
    onAlert(
      client,
      m,
      citiesData.cities,
      citiesData.areas,
      citiesData.countdown
    );
}

module.exports = { wsConnect };
