require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const parentDirectory = path.join(__dirname, "..");

const channelServer = path.join(parentDirectory, "channelServer.json");

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

    const jsonData = JSON.parse(
      fs.readFileSync(channelServer, {
        encoding: "utf8",
      })
    );

    if (jsonData[serverId]) {
      jsonData[serverId].channel = channelId;
      console.log(`Channel Id updated for server ${serverId}`);
    } else {
      const newObj = {
        [serverId]: {
          ...jsonData[serverId],
          channel: channelId,
        },
      };

      Object.assign(jsonData, newObj);
    }

    const newData = JSON.stringify(jsonData);

    fs.writeFileSync(channelServer, newData, "utf8");

    await interaction.reply({ content: "החדר הוגדר בהצלחה", ephemeral: true });
  },
};
