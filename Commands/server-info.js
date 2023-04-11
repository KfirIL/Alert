require("dotenv").config();
const fs = require("node:fs");

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרות-שרת")
    .setDescription("מציג את הגדרות השרת הקיימות")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const serverID = interaction.guild.id;
    const json = JSON.parse(fs.readFileSync("channelServer.json", "utf8"));
    const isChannel = interaction.guild.channels.cache.has(
      json[serverID].channel
    );
    const isRole = interaction.guild.roles.cache.has(json[serverID].role);
    const embed = new EmbedBuilder()
      .setColor("e8793f")
      .setTitle("הגדרות הקיימות בשרת זה")
      .setAuthor({
        name: "התרעות פיקוד העורף",
        url: "https://www.oref.org.il//12481-he/Pakar.aspx",
        iconURL:
          "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png",
      })
      .setDescription("להלן הגדרות אשר הוגדרו בשרת זה:")
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/776039568163995649/1094287528451915906/Pakar.png"
      )
      .addFields(
        {
          name: "החדר בו יישלחו התרעות",
          value: isChannel ? `<#${json[serverID].channel}>` : "לא הוגדר",
          inline: true,
        },
        {
          name: "תפקיד שיתוייג בעת שליחת התרעה",
          value: isRole
            ? json[serverID].role !== "@everyone"
              ? `<@&${json[serverID].role}>`
              : "@everyone"
            : "לא הוגדר",
          inline: true,
        },
        { name: "\u200B", value: "\u200B" }
      )
      .setFooter({
        text: "התוכן לא מהווה תחליף להתרעות בזמן אמת | על מנת לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
