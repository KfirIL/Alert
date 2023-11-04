const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  PermissionsBitField,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("התרעה-מדומה")
    .setDescription("מציג כיצד תראה התרעה בזמן אמת (כולל תיוג)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const serverId = interaction.guild.id;
    const server = await collection.findOne({ _id: serverId });

    const alert = {
      cities: [
        "עיר ניסיון א",
        "עיר ניסיון ב",
        "עיר ניסיון ג",
        "עיר ניסיון ד",
        "עיר ניסיון ה",
      ],
      isDrill: false,
      threat: 0,
      time: new Date().getTime(),
    };

    const channel = interaction.guild.channels.cache.has(server.channel)
      ? interaction.guild.channels.cache.get(server.channel)
      : undefined;

    if (channel === undefined)
      return interaction.reply({
        content: "נא להגדיר חדר קודם",
        ephemeral: true,
      });
    else if (
      !channel
        .permissionsFor(interaction.guild.members.me)
        .has(PermissionsBitField.Flags.SendMessages)
    )
      return interaction.reply({
        content: "חסרה גישה לחדר המוגדר",
        ephemeral: true,
      });

    let citiesString = "";

    for (let city in alert.cities) citiesString += alert.cities[city] + ", ";

    const embed = new EmbedBuilder()
      .setColor("#ff3d00")
      .setTitle("צבע אדום")
      // .setURL("https://www.oref.org.il//12481-he/Pakar.aspx")
      .setDescription(citiesString.slice(0, -2))
      .setAuthor({
        name: "התרעות בישראל",
      })
      .setThumbnail(
        "https://cdn.discordapp.com/attachments/1041017624299048981/1132264780481187860/Alert-Logo.png"
      )
      .addFields(
        {
          name: "אזור בארץ:",
          value: "ניסיון",
        },
        { name: "\u200B", value: "\u200B" },
        { name: "זמן כניסה למרחב מוגן:", value: "15 שניות" },
        { name: "\u200B", value: "\u200B" }
      )
      .setFooter({
        text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
      })
      .setTimestamp(new Date(alert.time));

    channel.send({
      embeds: [embed],
      content: interaction.guild.roles.cache.has(server.role)
        ? interaction.guild.roles.cache.get(server.role).name !== "@everyone"
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
