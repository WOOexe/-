import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from 'discord.js';

const ROLE_OPTIONS = Array.from({ length: 5 }, (_, i) => i + 1);

export default {
  data: new SlashCommandBuilder()
    .setName('selfrolesetup')
    .setDescription('Create a self-role panel with buttons')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addChannelOption(option => option
      .setName('channel')
      .setDescription('Channel where the panel will be posted')
      .addChannelTypes(0)
      .setRequired(true))
    .addStringOption(option => option.setName('title').setDescription('Panel title').setMaxLength(100).setRequired(true))
    .addStringOption(option => option.setName('description').setDescription('Short instructions').setMaxLength(1000).setRequired(true))
    .addRoleOption(option => option.setName('role1').setDescription('First self-assignable role').setRequired(true))
    .addRoleOption(option => option.setName('role2').setDescription('Second self-assignable role').setRequired(false))
    .addRoleOption(option => option.setName('role3').setDescription('Third self-assignable role').setRequired(false))
    .addRoleOption(option => option.setName('role4').setDescription('Fourth self-assignable role').setRequired(false))
    .addRoleOption(option => option.setName('role5').setDescription('Fifth self-assignable role').setRequired(false)),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ You need Manage Roles permission.', flags: MessageFlags.Ephemeral });
    }
    const channel = interaction.options.getChannel('channel');
    const title = interaction.options.getString('title', true);
    const description = interaction.options.getString('description', true);
    const roles = ROLE_OPTIONS
      .map(n => interaction.options.getRole(`role${n}`))
      .filter(Boolean);

    const me = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ I need the Manage Roles permission.', flags: MessageFlags.Ephemeral });
    }

    for (const role of roles) {
      if (role.id === interaction.guild.id || role.managed ||
          role.permissions.has([PermissionFlagsBits.Administrator, PermissionFlagsBits.ManageGuild, PermissionFlagsBits.ManageRoles, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.BanMembers, PermissionFlagsBits.KickMembers, PermissionFlagsBits.MentionEveryone]) ||
          role.position >= me.roles.highest.position) {
        return interaction.reply({ content: `❌ The role **${role.name}** is protected or above my highest role. Choose a normal role below the bot's role.`, flags: MessageFlags.Ephemeral });
      }
    }

    const rows = [];
    for (let i = 0; i < roles.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(
        ...roles.slice(i, i + 5).map(role => new ButtonBuilder()
          .setCustomId(`selfrole:${role.id}`)
          .setLabel(role.name.slice(0, 80))
          .setStyle(ButtonStyle.Primary))
      ));
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(`${description}\n\nClick a role button to add it; click it again to remove it.`)
      .setColor(0x5865F2)
      .setFooter({ text: 'Self Roles' });

    await channel.send({ embeds: [embed], components: rows });
    return interaction.reply({ content: `✅ Self-role panel created in ${channel}.`, flags: MessageFlags.Ephemeral });
  },
};
