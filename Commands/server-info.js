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
    let server = await collection.findOne({ _id: serverId });
    if (!server)
      server = {
        channel: "",
        role: "",
        areas: {},
      };
    const isChannel = interaction.guild.channels.cache.has(server.channel);
    const isRoleExist = interaction.guild.roles.cache.has(server.role);
    const role = interaction.guild.roles.cache.get(server.role);
    const embed = new EmbedBuilder() // The embed
      .setColor("#ff3d00")
      .setTitle("הגדרות הקיימות בשרת זה")
      .setAuthor({
        name: "מנהל ההתרעות של ישראל",
      })
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1041017624299048981/1132264780481187860/Alert-Logo.png"
      )
      .setDescription("להלן הגדרות אשר הוגדרו בשרת זה:")
      .addFields(
        {
          name: "החדר בו יישלחו התרעות",
          value: isChannel ? `<#${server.channel}>` : "לא הוגדר",
          inline: true,
        },
        {
          name: "תפקיד שיתוייג בעת שליחת התרעה",
          value: isRoleExist
            ? role.name !== "@everyone"
              ? `<@&${server.role}>`
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
      .setCustomId("resetchannel")
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
