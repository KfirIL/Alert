const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-תפקיד-התרעה")
    .setDescription("התפקיד שיתויג במקרה התרעה")
    .addRoleOption((option) =>
      option
        .setName("התפקיד-שיתוייג-במקרה-התרעה")
        .setRequired(true)
        .setDescription("הכנס את רול ההתרעה שברצונך לקבל בו את ההתרעות")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const serverId = interaction.guild.id;
    const roleId = interaction.options.getRole("התפקיד-שיתוייג-במקרה-התרעה").id;

    const server = await collection.findOneAndUpdate(
      { _id: serverId },
      { $set: { role: roleId } }
    );

    if (!server) {
      try {
        collection.insertOne({
          _id: serverId,
          channel: "",
          role: roleId,
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

    await interaction.reply({
      content: "התפקיד הוגדר בהצלחה",
      ephemeral: true,
    });
  },
};
