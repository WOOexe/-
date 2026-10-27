import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  MessageFlags,
} from 'discord.js';

const TEXT_CHANNELS = [ChannelType.GuildText, ChannelType.GuildAnnouncement];

export default {
  data: new SlashCommandBuilder()
    .setName('messagesend')
    .setDescription('Send an announcement as the bot')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('Channel where the message will be sent')
      .addChannelTypes(...TEXT_CHANNELS)
      .setRequired(true))
    .addStringOption(option => option
      .setName('message')
      .setDescription('Message to send (up to 2000 characters)')
      .setMaxLength(2000)
      .setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message', true);

    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      return interaction.reply({ content: '❌ You need Manage Messages permission.', flags: MessageFlags.Ephemeral });
    }
    if (!channel || !TEXT_CHANNELS.includes(channel.type)) {
      return interaction.reply({ content: '❌ Choose a text or announcement channel.', flags: MessageFlags.Ephemeral });
    }
    const botMember = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
    if (!channel.permissionsFor(botMember)?.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({ content: `❌ I cannot send messages in ${channel}.`, flags: MessageFlags.Ephemeral });
    }

    const sent = await channel.send({ content: message });
    return interaction.reply({
      content: `✅ Message sent in ${channel}. [Jump to message](${sent.url})`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
