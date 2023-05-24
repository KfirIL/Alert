const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check your ping"),
  async execute(interaction) {
    let startTime = new Date().getTime();
    await interaction.reply(
      `🏓 | Latency is: **${
        new Date(interaction.createdTimestamp).getTime() - startTime
      }ms.**`
    );
  },
};
