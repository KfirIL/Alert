require("dotenv").config();
const fs = require("node:fs");

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-חדר-התרעות")
    .setDescription("חדר שבו יוצגו ההתרעות")
    .addChannelOption((option) =>
      option
        .setName("הערוץ-בו-תרצה-לקבל-התרעות")
        .setRequired(true)
        .setDescription("הכנס את הערוץ שבו אתה רוצה לקבל את ההתרעות")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const serverID = interaction.guild.id;
    const channelID = interaction.options.getChannel(
      "הערוץ-בו-תרצה-לקבל-התרעות"
    ).id;

    const jsonData = JSON.parse(
      fs.readFileSync("channelServer.json", {
        encoding: "utf8",
      })
    );

    if (jsonData[serverID]) {
      jsonData[serverID].channel = channelID;
      console.log(`Channel ID updated for server ${serverID}`);
    } else {
      const newObj = {
        [serverID]: {
          channel: channelID,
        },
      };

      Object.assign(jsonData, newObj);
    }

    const newData = JSON.stringify(jsonData);

    fs.writeFileSync("channelServer.json", {
      data: newData,
    });

    await interaction.reply({ content: "החדר הוגדר בהצלחה", ephemeral: true });
  },
};
