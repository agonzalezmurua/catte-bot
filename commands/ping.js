const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Test if the bot is really alive or not");

module.exports = {
  data,
  /**
   * Test if the bot is really alive or not
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    if (interaction.isCommand() === false) {
      return;
    }

    await interaction.reply("Pong!");
  },
};
