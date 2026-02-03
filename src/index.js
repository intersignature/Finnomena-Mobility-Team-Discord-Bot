require('dotenv').config({ quiet: true });
const {
  Client,
  IntentsBitField,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ChannelType,
  PermissionsBitField,
  MessageFlags,
} = require('discord.js');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildVoiceStates,
  ],
});

client.on('clientReady', (client) => {
  console.log(
    `${client.user.username} is online on ${client.guilds.cache.get(process.env.GUILD_ID)}`,
  );
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId == '0') {
        // create meeting room
        const modal = new ModalBuilder()
          .setCustomId(`create-meeting-room-modal-${interaction.id}`)
          .setTitle('Set your new meeting room name');

        const meetingNameInput = new TextInputBuilder()
          .setCustomId('new-meeting-name-input')
          .setLabel('Meeting name')
          .setStyle(TextInputStyle.Short);

        const row = new ActionRowBuilder().addComponents(meetingNameInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
        return;
      } else if (interaction.customId == '1') {
        // remove action | Lunch, | Toilet | Break, | Meeting
        const newName = cleanStatusFromNickname(interaction.member.nickname);
        await interaction.member.setNickname(newName);
      } else {
        // add action | Lunch, | Toilet, | Break, | Meeting
        const newName = `${cleanStatusFromNickname(interaction.member.nickname)} | ${interaction.component.label}`;
        await interaction.member.setNickname(newName);
      }
    } else if (interaction.isModalSubmit) {
      const interactionCustomID = interaction.customId;
      if (interactionCustomID.includes('create-meeting-room-modal')) {
        const meetingName = interaction.fields.getTextInputValue(
          'new-meeting-name-input',
        );

        // create channel
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        await guild.channels
          .create({
            name: meetingName,
            type: ChannelType.GuildVoice,
            parent: process.env.MEETING_ROOM_CATEGORY_ID,
            permissionOverwrites: [
              {
                id: guild.roles.everyone.id,
                accept: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              },
            ],
          })
          .then((channel) => {
            if (interaction.member.voice.channel) {
              interaction.member.voice.setChannel(channel.id);
            }
          });
      }
    }
  } catch (error) {
    interaction.guild.channels.cache
      .get(process.env.ERROR_LOG_ROOM_ID)
      .send(error.stack.toString());
    await interaction.reply({
      content: '❌ There was an error from your action!',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  await interaction.reply({
    content: '✅ Action is success!',
    ephemeral: true,
  });
  return;
});

client.on('voiceStateUpdate', (oldState, newState) => {
  // Check if the user was in a channel and is no longer in one
  if (oldState.channel) {
    if (
      oldState.channel.parent.name.toLowerCase().includes('meeting') &&
      oldState.channel.members.size == 0 &&
      oldState.channel.deletable
    ) {
      oldState.channel.delete();
    }
  }
});

client.login(process.env.TOKEN);

function cleanStatusFromNickname(nickname) {
  if (!nickname) return nickname;

  return nickname
    .replace(' | Lunch', '')
    .replace(' | Toilet', '')
    .replace(' | Break', '')
    .replace(' | Meeting', '');
}
