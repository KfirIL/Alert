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
    if (!json[serverId]) {
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
    const timeString = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const alert = {
      data: "[אזור ניסיון]",
      time: timeString,
      alertDate: new Date(),
      category_desc: "[סוג ההתרעה]",
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
      .setTimestamp(alert.alertDate);
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
