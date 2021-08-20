const _ = require("lodash");
const ms = require("ms");
const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { DatabaseClient } = require("../services/database");
const { GsheetClient } = require("../services/gsheet_client");
const wait = require("util").promisify(setTimeout);

const data = new SlashCommandBuilder()
  .setName("awards")
  .setDescription("Catte awards!")
  .addSubcommand((subCommand) =>
    subCommand
      .setName("results")
      .setDescription("shows the curated results of the catte awards")
      .addIntegerOption((option) =>
        option
          .setName("category-delay")
          .setDescription("delay in seconds between each message")
          .setRequired(true)
      )
      .addIntegerOption((option) =>
        option
          .setName("winner-delay")
          .setDescription("delay in seconds between each winner")
          .setRequired(true)
      )
  )
  .addSubcommand((subCommand) =>
    subCommand
      .setName("moments")
      .setDescription("shows moments shared by our beloved community")
      .addIntegerOption((option) =>
        option
          .setName("delay")
          .setDescription("delay in seconds between each message")
          .setRequired(true)
      )
  );

module.exports = {
  data,
  /**
   * Test if the bot is really alive or not
   * @param {import("discord.js").CommandInteraction} interaction
   */
  async execute(interaction) {
    await interaction.channel.sendTyping();

    const [entries, answers] = await Promise.all([
      GsheetClient.getQuestions(),
      DatabaseClient.getAnswers(),
    ]);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "moments") {
      const delay = interaction.options.getInteger("delay");
      interaction.reply({
        content: `Sending moments with a delay of ${delay} seconds`,
        ephemeral: true,
      });

      for (const moment of answers.map(({ choices: { MOMENTO } }) => MOMENTO)) {
        interaction.channel.send(`\`\`\`${moment}\`\`\``);
        await wait(delay * 1000);
      }
    } else if (subcommand === "results") {
      const category_delay = interaction.options.getInteger("category-delay");
      const winner_delay = interaction.options.getInteger("winner-delay");
      const guild = await interaction.guild.fetch();

      interaction.reply({
        content: `Sending results with a delay per category of ${category_delay} seconds, and message delay of ${winner_delay} seconds (${ms(
          (category_delay + winner_delay * 3) * entries.length * 1000
        )} total aprox)`,
        ephemeral: true,
      });

      for (const entry of entries) {
        const members = await guild.members.list();
        // TODO: uncomment when all banners are loaded
        const entryEmbed = new MessageEmbed()
          .setTitle(entry.title)
          .setDescription(entry.description)
          // .setImage(entry.banner)
          .setColor("#FFC0CB");

        /**
         * MapSet of user id and amount of votes
         * @type {Map<string, number>}
         */
        const votes = new Map();

        for (answer of answers) {
          const value = answer.choices[entry.name];
          if (!votes.has(value)) {
            votes.set(value, 0);
          }
          votes.set(value, votes.get(value) + 1);
        }

        const results = _.sortBy(
          Array.from(votes, ([id, count]) => ({
            id: id,
            count: count,
          })),
          ["count"]
        );

        const [third, second, first] = await Promise.all(
          results.slice(Math.max(results.length - 3, 0)).map(async (winner) => {
            const member = members.find(
              (member) => member.user.id === winner.id
            );
            return {
              user: member?.user,
              count: winner.count,
            };
          })
        );

        function composeUserEmbed({ user, count }) {
          const percentage = Math.round((count / answers.length) * 100);
          return new MessageEmbed()
            .setImage(
              user?.avatarURL({ dynamic: true }) ||
                "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
            )
            .setDescription(`${user || "<Redacted>"}`)
            .addField("Votos", `${count}`, true)
            .addField("Porcentaje", `${percentage}%`, true)
            .setFooter("Catte Awards 2021");
        }

        // Send category header
        await interaction.channel.send({ embeds: [entryEmbed] });

        await wait(winner_delay * 1000);

        await interaction.channel.send({
          embeds: [
            composeUserEmbed(third)
              .setTitle(`🥉 Tercer Lugar`)
              .setColor("#CD7F32"),
          ],
        });
        await wait(winner_delay * 1000);

        await interaction.channel.send({
          embeds: [
            composeUserEmbed(second)
              .setTitle(`🥈 Segundo Lugar`)
              .setColor("#C0C0C0"),
          ],
        });
        await wait(winner_delay * 1000);

        await interaction.channel.send({
          content: "🥁🥁🥁🥁",
        });
        await wait(ms("3s"));

        await interaction.channel.send({
          embeds: [
            composeUserEmbed(first)
              .setTitle(`🥇 Primer lugar`)
              .setColor("#FFD700"),
          ],
        });
        await wait(category_delay * 1000);
      }
    } else {
      await interaction.reply({
        content: `Total of ${entries.length} questions with ${answers.length} answers so far!`,
        ephemeral: true,
      });
    }
  },
};
