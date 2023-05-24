require("dotenv").config();
const fs = require("node:fs");

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("התרעה-מדומה")
    .setDescription("מציג כיצד תראה התרעה בזמן אמת (כולל תיוג)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const json = JSON.parse(fs.readFileSync("channelServer.json", "utf8"));
    const serverId = interaction.guild.id;
    if (json[serverId] === undefined) {
      const newObj = {
        [serverId]: {
          channel: "123",
          role: "123",
        },
      };
      Object.assign(json, newObj);

      const newData = JSON.stringify(json);

      fs.writeFileSync("channelServer.json", newData, "utf8");
    }

    const alert = {
      cities: ["עיר ניסיון א", "עיר ניסיון ב", "עיר ניסיון ג"],
      isDrill: false,
      threat: 0,
      time: new Date().getTime(),
    };

    const channel = interaction.guild.channels.cache.has(json[serverId].channel)
      ? interaction.guild.channels.cache.get(json[serverId].channel)
      : undefined;

    if (channel === undefined)
      return interaction.reply({
        content: "נא להגדיר חדר קודם",
        ephemeral: true,
      });

    const embed = new EmbedBuilder()
      .setColor("#f39a20")
      .setTitle(`התרעת פיקוד העורף ב־${alert.cities.length} ערים`)
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
      .setFooter({
        text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
      })
      .setTimestamp(new Date(alert.time));

    for (let city in alert.cities) {
      embed.addFields({ name: alert.cities[city], value: "\u2800" });
    }
    embed.addFields({ name: "\u200B", value: "\u200B" });

    channel.send({
      embeds: [embed],
      content: interaction.guild.roles.cache.has(json[serverId].role)
        ? interaction.guild.roles.cache.get(json[serverId].role).name !==
          "@everyone"
          ? `<@&${json[serverId].role}>`
          : "@everyone"
        : undefined,
    });

    interaction.reply({
      ephemeral: true,
      content: "הפעולה בוצעה בהצלחה",
    });
  },
};
