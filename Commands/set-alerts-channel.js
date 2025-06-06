const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-חדר-התרעות")
    .setDescription("החדר שבו יוצגו ההתרעות")
    .addChannelOption((option) =>
      option
        .setName("הערוץ-בו-תרצה-לקבל-התרעות")
        .setRequired(true)
        .setDescription("הכנס את הערוץ שבו אתה רוצה לקבל את ההתרעות")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const channelId = interaction.options.getChannel(
      "הערוץ-בו-תרצה-לקבל-התרעות"
    ).id;

    const server = await collection.findOneAndUpdate(
      { _id: serverId },
      { $set: { channel: channelId } }
    );

    if (!server) {
      try {
        collection.insertOne({
          _id: serverId,
          channel: channelId,
          role: "",
          areas: {
            north: [],
            center: [],
            south: [],
          },
          creationDate: new Date(),
        });
      } catch (e) {
        console.log(e);
      }
    }

    await interaction.reply({ content: "החדר הוגדר בהצלחה", ephemeral: true });
  },
};
