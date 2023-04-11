require("dotenv").config();
const fs = require("node:fs");

const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרות-שרת")
    .setDescription("מציג את הגדרות השרת הקיימות")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const serverID = interaction.guild.id;
    const json = JSON.parse(fs.readFileSync("channelServer.json", "utf8"));
    if (!json[serverID]) {
      const newObj = {
        [serverID]: {},
      };
      Object.assign(json, newObj);

      const newData = JSON.stringify(json);

      fs.writeFileSync("channelServer.json", newData, "utf8");
    }
    const isChannel = interaction.guild.channels.cache.has(
      json[serverID].channel
    );
    const isRole = interaction.guild.roles.cache.has(json[serverID].role);
    const role = interaction.guild.roles.cache.get(json[serverID].role);
    const embed = new EmbedBuilder() // The embed
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
            ? role.name !== "@everyone"
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

    const reset = new ActionRowBuilder() // Reset All Button
      .addComponents(
        new ButtonBuilder()
          .setCustomId("reset")
          .setLabel("אפס את כל ההגדרות")
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({
      embeds: [embed],
      components: [reset],
      ephemeral: true,
    });
  },
};
