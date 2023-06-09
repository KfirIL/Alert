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
    const serverId = interaction.guild.id;
    const json = JSON.parse(fs.readFileSync("channelServer.json", "utf8"));
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
    const isChannel = interaction.guild.channels.cache.has(
      json[serverId].channel
    );
    const isRole = interaction.guild.roles.cache.has(json[serverId].role);
    const role = interaction.guild.roles.cache.get(json[serverId].role);
    const embed = new EmbedBuilder() // The embed
      .setColor("#f39a20")
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
          value: isChannel ? `<#${json[serverId].channel}>` : "לא הוגדר",
          inline: true,
        },
        {
          name: "תפקיד שיתוייג בעת שליחת התרעה",
          value: isRole
            ? role.name !== "@everyone"
              ? `<@&${json[serverId].role}>`
              : "@everyone"
            : "לא הוגדר",
          inline: true,
        },
        { name: "\u200B", value: "\u200B" }
      )
      .setFooter({
        text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
      })
      .setTimestamp(new Date());

    const resetAll = new ButtonBuilder() // Reset All Button
      .setCustomId("resetall")
      .setLabel("אפס את כל ההגדרות")
      .setStyle(ButtonStyle.Danger);

    const resetRoom = new ButtonBuilder() // Reset All Button
      .setCustomId("resetroom")
      .setLabel("אפס את חדר ההתרעות")
      .setStyle(ButtonStyle.Danger);

    const resetRole = new ButtonBuilder() // Reset All Button
      .setCustomId("resetrole")
      .setLabel("אפס את תפקיד ההתרעות")
      .setStyle(ButtonStyle.Danger);

    await interaction.reply({
      embeds: [embed],
      components: [
        new ActionRowBuilder().addComponents(resetAll, resetRoom, resetRole),
      ],
      ephemeral: true,
    });
  },
};
