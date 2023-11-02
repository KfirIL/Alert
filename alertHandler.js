const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const WebSocket = require("ws");

const channelServer = path.join(__dirname, "channelServer.json");
const errorsandsomeshit = path.join(__dirname, "errorsandsomeshit.txt");

const WEBSOCKET_URL = "wss://ws.tzevaadom.co.il:8443/socket?platform=WEB";

function writeToErrorsAndDataFile(data) {
  let text = fs.readFileSync(errorsandsomeshit, {
    encoding: "utf8",
  });
  text += `\n${JSON.stringify(data)}`;
  fs.writeFileSync(errorsandsomeshit, text, "utf8");
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
  if (type != "ALERT") return;
  if (alert.threat !== 0 && alert.threat !== 2) return;
  writeToErrorsAndDataFile(alert);
  console.log(JSON.stringify(alert));

  // Reloading json file.
  const json = JSON.parse(
    fs.readFileSync(channelServer, {
      encoding: "utf8",
    })
  );

  const title =
    alert.threat === 0
      ? "ירי טילים ורקטות"
      : alert.threat === 2
      ? "חשש לחדירת מחבל"
      : undefined;

  let times = {};

  let allSame = true;
  let lastCount = "0";
  let embedDescription = "";

  for (let city in alert.cities) {
    const cityCountDown = countdown[cities[alert.cities[city]].countdown]["he"];
    if (lastCount === "0") lastCount = cityCountDown;
    else if (lastCount != cityCountDown) allSame = false;
    if (times[cityCountDown] === undefined) times[cityCountDown] = [];
    times[cityCountDown].push(alert.cities[city]);
    lastCount = cityCountDown;

    embedDescription += alert.cities[city] + ", ";
  }

  const embed = new EmbedBuilder()
    .setColor("#ff3d00")
    .setTitle(title)
    .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
    .setDescription(embedDescription.slice(0, -2))
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
        name: allSame ? "זמן כניסה למרחב מוגן:" : "זמני כניסה למרחב מוגן:",
        value: allSame ? `${lastCount}` : "\u200B", // Whitespace character
      }
    )
    .setFooter({
      text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
    })
    .setTimestamp(new Date(alert.time * 1000));

  if (!allSame) {
    Object.entries(times).forEach(([time]) => {
      let citiesString = "";
      times[time].forEach((city) => (citiesString += city + ", "));
      embed.addFields({
        name: citiesString.slice(0, -2),
        value: time,
      });
    });
  }

  embed.addFields({ name: "\u200B", value: "\u200B" });

  for (let server in json) {
    const guild = client.guilds.cache.get(server);
    if (guild === undefined) continue;
    const channel = guild.channels.cache.has(json[server].channel)
      ? guild.channels.cache.get(json[server].channel)
      : undefined;

    if (
      channel == undefined ||
      !channel
        .permissionsFor(guild.members.me)
        .has(PermissionsBitField.Flags.SendMessages)
    )
      continue;

    channel.send({
      embeds: [embed],
      content: guild.roles.cache.has(json[server].role)
        ? guild.roles.cache.get(json[server].role).name !== "@everyone"
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
