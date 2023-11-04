const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ActionRowBuilder,
} = require("discord.js");

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרת-אזורי-התרעה")
    .setDescription("האזורים שבהם יתקבלו התרעות")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("מחוז")
        .setDescription("בחר מחוז")
        .setRequired(true)
        .addChoices(
          { name: "צפון", value: "north" },
          { name: "מרכז", value: "center" },
          { name: "דרום", value: "south" }
        )
    ),
  async execute(interaction) {
    const serverId = await interaction.guild.id;
    const district = await interaction.options.getString("מחוז");
    const server = await collection.findOne({ _id: serverId });

    const areaSelect = new StringSelectMenuBuilder()
      .setCustomId("areas")
      .setPlaceholder("בחר אזורים")
      .setMinValues(0)
      .setMaxValues(districts[district].length);

    districts[district].forEach((area) => {
      areaSelect.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(area)
          .setValue(area.replace(/ /g, "-"))
          .setDefault(server ? server.areas[district].includes(area) : false)
      );
    });

    const areasRow = new ActionRowBuilder().addComponents(areaSelect);

    const areaResponse = await interaction.reply({
      components: [areasRow],
      ephemeral: true,
    });

    try {
      const areaConfirmation = await areaResponse.awaitMessageComponent({
        time: 60000,
      });

      let areas = {
        north: [],
        center: [],
        south: [],
      };
      if (!server) {
        areas[district] = areaConfirmation.values.sort();
        try {
          collection.insertOne({
            _id: serverId,
            channel: "",
            role: "",
            areas: areas,
            creationDate: new Date(),
          });
        } catch (e) {
          console.log(e);
        }
      } else {
        areas = server.areas;
        areas[district] = areaConfirmation.values
          .sort()
          .map((area) => area.replace(/-/g, " "));
        await collection.findOneAndUpdate(
          { _id: serverId },
          { $set: { areas: areas } }
        );
      }

      await interaction.editReply({
        content: "נוספו האזורים שנבחרו.",
        components: [],
      });

      await sleep(2000);
      interaction.deleteReply();
    } catch (e) {
      await interaction.editReply({
        content: "Confirmation not received within 1 minute, cancelling",
        components: [],
      });
    }
  },
};
