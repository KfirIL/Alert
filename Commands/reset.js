const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("אפס-הגדרה")
    .setDescription("מאפס הגדרה קיימת")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("הגדרה")
        .setDescription("בחר הגדרה")
        .setRequired(true)
        .addChoices(
          { name: "אפס הכול", value: "reset_all" },
          { name: "אפס חדר התרעות", value: "reset_channel" },
          { name: "אפס תיוג התרעות", value: "reset_role" },
          { name: "אפס אזורי התרעות", value: "reset_areas" }
        )
    ),
  async execute(interaction) {
    const serverId = interaction.guild.id;
    const setting = interaction.options.getString("הגדרה");

    let text = "ההגדרה אופסה.";
    switch (setting) {
      case "reset_all":
        await collection.findOneAndUpdate(
          { _id: serverId },
          { $set: serverTemplate }
        );
        text = "כל ההגדרות אופסו.";
        break;
      case "reset_channel":
        await collection.findOneAndUpdate(
          { _id: serverId },
          { $set: { channel: serverTemplate.channel } }
        );
        break;
      case "reset_role":
        await collection.findOneAndUpdate(
          { _id: serverId },
          { $set: { role: serverTemplate.role } }
        );
        break;
      case "reset_areas":
        await collection.findOneAndUpdate(
          { _id: serverId },
          { $set: { areas: serverTemplate.areas } }
        );
        break;
    }

    await interaction.reply({
      ephemeral: true,
      content: text,
    });
  },
};
