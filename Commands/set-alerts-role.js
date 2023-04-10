require("dotenv").config();
const fs = require("node:fs");

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-תפקיד-התרעה")
    .setDescription("חדר שבו יוצגו ההתרעות")
    .addRoleOption((option) =>
      option
        .setName("התפקיד-שיתוייג-במקרה-התרעה")
        .setRequired(true)
        .setDescription(
          "הכנס את רול ההתרעה שברצונך לקבל בו את התרעות פיקוד העורף"
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const serverID = interaction.guild.id;
    const roleID = interaction.options.getRole("התפקיד-שיתוייג-במקרה-התרעה").id;

    const jsonData = JSON.parse(
      fs.readFileSync("channelServer.json", {
        encoding: "utf8",
      })
    );

    if (jsonData[serverID]) {
      jsonData[serverID].role = roleID;
      console.log(`Role ID updated for server ${serverID}`);
    } else {
      const newObj = {
        [serverID]: {
          ...jsonData[serverID],
          role: roleID,
        },
      };

      Object.assign(jsonData, newObj);
    }

    const newData = JSON.stringify(jsonData);

    fs.writeFileSync("channelServer.json", newData, "utf8");

    await interaction.reply({
      content: "התפקיד הוגדר בהצלחה",
      ephemeral: true,
    });
  },
};
