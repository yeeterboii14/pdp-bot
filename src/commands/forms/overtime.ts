import {
   PermissionsBitField,
   SlashCommandBuilder,
   ActionRowBuilder,
   ModalBuilder,
   TextInputBuilder,
   TextInputStyle,
} from 'discord.js'
import Command from '../../structures/classes/Command.js'

export default new Command({
   data: new SlashCommandBuilder()
      .setName('overtime')
      .setDescription('Adds an overtime event to an employee')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
         return await interaction.reply({
            content: `You must be a Supervisor to add overtime events to employees!`,
            ephemeral: true,
         })

      const questions: any = [
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('employee')
               .setLabel('What employee participated in the event?')
               .setPlaceholder('Must be the exact username.')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(1024)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('event')
               .setLabel('What was the event named?')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(1024)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('date')
               .setLabel('On what date did the event occurr?')
               .setPlaceholder('"MM/DD/YYYY"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
      ]

      const modal = new ModalBuilder()
         .setCustomId('overtime-modal')
         .setTitle(`Overtime Submission Form`)

      modal.addComponents(...questions)

      await interaction.showModal(modal)
   },
})
