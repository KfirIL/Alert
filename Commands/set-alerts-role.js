require("dotenv").config();
const fs = require("node:fs");
const path = require("node:path");
const parentDirectory = path.join(__dirname, "..");

const channelServer = path.join(parentDirectory, "channelServer.json");

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

    const jsonData = JSON.parse(
      fs.readFileSync(channelServer, {
        encoding: "utf8",
      })
    );

    if (jsonData[serverId]) {
      jsonData[serverId].role = roleId;
      console.log(`Role Id updated for server ${serverId}`);
    } else {
      const newObj = {
        [serverId]: {
          ...jsonData[serverId],
          role: roleId,
        },
      };

      Object.assign(jsonData, newObj);
    }

    const newData = JSON.stringify(jsonData);

    fs.writeFileSync(channelServer, newData, "utf8");

    await interaction.reply({
      content: "התפקיד הוגדר בהצלחה",
      ephemeral: true,
    });
  },
};
