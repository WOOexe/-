import { MessageFlags, PermissionFlagsBits } from 'discord.js';

export default {
  name: 'selfrole',
  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({ content: 'This button only works in a server.', flags: MessageFlags.Ephemeral });
    }

    const roleId = interaction.customId.split(':')[1];
    const role = interaction.guild.roles.cache.get(roleId);
    if (!role) {
      return interaction.reply({ content: '❌ This role no longer exists.', flags: MessageFlags.Ephemeral });
    }

    const me = interaction.guild.members.me ?? await interaction.guild.members.fetchMe();
    if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: '❌ The bot needs Manage Roles permission.', flags: MessageFlags.Ephemeral });
    }

    const blocked = role.managed || role.id === interaction.guild.id ||
      role.permissions.has([
        PermissionFlagsBits.Administrator,
        PermissionFlagsBits.ManageGuild,
        PermissionFlagsBits.ManageRoles,
        PermissionFlagsBits.ManageChannels,
        PermissionFlagsBits.BanMembers,
        PermissionFlagsBits.KickMembers,
        PermissionFlagsBits.MentionEveryone,
      ]) ||
      role.position >= me.roles.highest.position;

    if (blocked) {
      return interaction.reply({ content: '❌ This role cannot be self-assigned. Ask an administrator to choose a normal role below the bot role.', flags: MessageFlags.Ephemeral });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    try {
      if (member.roles.cache.has(role.id)) {
        await member.roles.remove(role);
        return interaction.reply({ content: `➖ Role **${role.name}** removed.`, flags: MessageFlags.Ephemeral });
      }
      await member.roles.add(role);
      return interaction.reply({ content: `✅ Role **${role.name}** added.`, flags: MessageFlags.Ephemeral });
    } catch {
      return interaction.reply({ content: '❌ Could not update your role. Check the bot permissions and role hierarchy.', flags: MessageFlags.Ephemeral });
    }
  },
};
