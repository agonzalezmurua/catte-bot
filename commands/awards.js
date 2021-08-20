const { SlashCommandBuilder } = require("@discordjs/builders");

const data = new SlashCommandBuilder()
  .setName("awards")
  .setDescription("Catte awards!")
  .addSubcommand((subCommand) =>
    subCommand
      .setName("results")
      .setDescription("shows the curated results of the catte awards")
      .addStringOption((option) =>
        option
          .setName("year")
          .setDescription("year of the award")
          .setRequired(true)
          .addChoice("2021", "2021")
      )
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("moments")
      .setDescription("shows moments shared by our beloved community")
      .addStringOption((option) =>
        option
          .setName("year")
          .setDescription("year of the award")
          .setRequired(true)
          .addChoice("2021", "2021")
      )
  );

module.exports = {
  data,
  /**
   * Test if the bot is really alive or not
   * @param {import("discord.js").CommandInteraction} interaction
   */
  handler: (interaction) => {},
};
