require('dotenv').config({ quiet: true });
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

const firstRowActions = [
  {
    id: '0',
    label: 'Create Meeting room',
    buttonStyle: ButtonStyle.Primary,
  },
  {
    id: '1',
    label: 'Remove action',
    buttonStyle: ButtonStyle.Danger,
  },
];

const secondRowActions = [
  {
    id: '2',
    label: 'Meeting',
  },
  {
    id: '3',
    label: 'Lunch',
  },
  {
    id: '4',
    label: 'Toilet',
  },
  {
    id: '5',
    label: 'Break',
  },
];

client.on('clientReady', async (client) => {
  try {
    const channel = await client.channels.cache.get(
      process.env.INITIAL_MESSAGE_ROOM_ID,
    );
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor(0xf2f93c)
      .setTitle('Finnomena Mobility team helper bot')
      .setAuthor({
        name: 'Finnomena',
        iconURL:
          'https://cdn.brandfetch.io/id-vOcRApE/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1769676580256',
        url: 'https://www.finnomena.com/',
      })
      .setDescription(
        'A Discord bot that auto-creates temporary meeting rooms and lets users set their status (Meeting, Break, or Lunch) so teammates can easily see availability.',
      )
      .setThumbnail(
        'https://cdn.brandfetch.io/id-vOcRApE/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1769676580256',
      );

    const firstRow = new ActionRowBuilder();
    const secondRow = new ActionRowBuilder();

    firstRowActions.forEach((action) => {
      firstRow.components.push(
        new ButtonBuilder()
          .setCustomId(action.id)
          .setLabel(action.label)
          .setStyle(action.buttonStyle),
      );
    });

    secondRowActions.forEach((action) => {
      secondRow.components.push(
        new ButtonBuilder()
          .setCustomId(action.id)
          .setLabel(action.label)
          .setStyle(ButtonStyle.Primary),
      );
    });

    await channel.send({
      embeds: [embed],
      components: [firstRow, secondRow],
      ephemeral: true,
    });

    process.exit();
  } catch (error) {
    console.log(error);
  }
});

client.login(process.env.TOKEN);
