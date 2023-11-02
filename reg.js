const fs = require("node:fs");
const path = require("node:path");

const channelServer = path.join(parentDirectory, "channelServer.json");

const commands = new Map();
const commandsPath = path.join(__dirname, "Commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  // Set a new item in the Collection with the key as the command name and the value as the exported module
  if ("data" in command && "execute" in command) {
    commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

async function registerCommands(interaction) {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
}

function writeDataToFile(data) {
  const newData = JSON.stringify(data);
  fs.writeFileSync(channelServer, newData, "utf8");
}

async function registerButtons(interaction) {
  if (interaction.isButton()) {
    let json = JSON.parse(fs.readFileSync(channelServer, "utf8"));
    let text;
    switch (interaction.customId) {
      case "resetall":
        if (json[interaction.guild.id] === undefined) {
          const newObj = {
            [interaction.guild.id]: {
              channel: "",
              role: "",
            },
          };
          Object.assign(json, newObj);

          json = JSON.stringify(json);
        } else {
          json[interaction.guild.id].channel = "";
          json[interaction.guild.id].role = "";
        }
        writeDataToFile(json);
        text = "כל ההגדרות אופסו בהצלחה.";
        break;

      case "resetroom":
        json[interaction.guild.id].channel = "";
        writeDataToFile(json);
        text = "ההגדרה אופסה בהצלחה";
        break;

      case "resetrole":
        json[interaction.guild.id].role = "";
        text = "ההגדרה אופסה בהצלחה";
        break;
    }
    await interaction.reply({
      content: text,
      ephemeral: true,
    });
  }
}

module.exports = { registerCommands, registerButtons };
