require("dotenv").config();
const fs = require("node:fs");

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-חדר-התראות")
    .setDescription("חדר שבו יוצגו ההתראות")
    .addChannelOption((option) =>
      option
        .setName("הערוץ-בו-תרצה-לקבל-התראות")
        .setRequired(true)
        .setDescription("הכנס את הערוץ שבו אתה רוצה לקבל את ההתראות")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const serverID = interaction.guild.id;
    const channelID = interaction.options.getChannel(
      "הערוץ-בו-תרצה-לקבל-התראות"
    ).id;

    fs.readFile("channelServer.json", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      // Parse the JSON data
      let jsonData;
      try {
        jsonData = JSON.parse(data);
      } catch (e) {
        // Handle the case where the data is not valid JSON
        console.error("Error parsing JSON:", e);
        return;
      }

      // Check if the server already exists
      if (jsonData[serverID]) {
        // Update the channel ID for the existing server
        jsonData[serverID].channel = channelID;
        console.log(`Channel ID updated for server ${serverID}`);
      } else {
        // Generate a new object with the new data
        const newObj = {
          [serverID]: {
            channel: channelID,
          },
        };

        // Add the new object to the existing JSON object
        Object.assign(jsonData, newObj);
      }

      // Stringify the modified data
      const newData = JSON.stringify(jsonData);

      // Write the stringified data back to the file
      fs.writeFile("channelServer.json", newData, "utf8", (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    });

    await interaction.reply({ content: "החדר הוגדר בהצלחה", ephemeral: true });
  },
};
