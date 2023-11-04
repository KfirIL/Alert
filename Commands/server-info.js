const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} = require("discord.js");

async function sleep(seconds) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("הגדרות-שרת")
    .setDescription("מציג את הגדרות השרת הקיימות")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const serverId = interaction.guild.id;
    let server = await collection.findOne({ _id: serverId });
    if (!server) server = serverTemplate;

    async function load() {
      const doesChannelExist = interaction.guild.channels.cache.has(
        server.channel
      );
      const doesRoleExist = interaction.guild.roles.cache.has(server.role);
      const doesAreasExist = !Object.values(server.areas).every(
        (area) => !area.length
      );
      const roleName = doesRoleExist
        ? interaction.guild.roles.cache.get(server.role).name
        : undefined;

      return (embed = new EmbedBuilder() // The embed
        .setColor("#ff3d00")
        .setTitle("הגדרות הקיימות בשרת זה")
        .setAuthor({
          name: "מנהל ההתרעות של ישראל",
        })
        .setThumbnail(
          "https://cdn.discordapp.com/attachments/1041017624299048981/1132264780481187860/Alert-Logo.png"
        )
        .setDescription("להלן הגדרות אשר הוגדרו בשרת זה:")
        .addFields(
          {
            name: "החדר בו יישלחו התרעות",
            value: doesChannelExist ? `<#${server.channel}>` : "לא הוגדר",
            inline: true,
          },
          {
            name: "תפקיד שיתוייג בעת שליחת התרעה",
            value: doesRoleExist
              ? roleName !== "@everyone"
                ? `<@&${server.role}>`
                : "@everyone"
              : "לא הוגדר",
            inline: true,
          },
          {
            name: "האזורים שבהם יתקבלו התרעות",
            value: doesAreasExist
              ? Object.values(server.areas).flat().sort().join(", ")
              : "כל האזורים",
          },
          { name: "\u200B", value: "\u200B" }
        )
        .setFooter({
          text: "התוכן לא מהווה תחליף להתרעות בזמן אמת. כדי לקבל התרעות מדוייקות נא להיכנס לאתר פיקוד העורף.",
        })
        .setTimestamp(new Date()));
    }

    await interaction.reply({
      embeds: [await load()],
      ephemeral: true,
    });

    const changeStream = collection.watch([], { fullDocument: "updateLookup" });

    changeStream.on("change", async (change) => {
      if (change.fullDocument._id === serverId) {
        server = change.fullDocument;
        await interaction.editReply({
          embeds: [await load()],
          ephemeral: true,
        });
      }
    });

    await sleep(300);
    await changeStream.close();
  },
};
