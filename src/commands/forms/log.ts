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
      .setName('log')
      .setDescription('Submits a patrol log')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const questions: any = [
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('start')
               .setLabel('At what time did your patrol start?')
               .setPlaceholder('"11:32 PM EST"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('end')
               .setLabel('At what time did your patrol end?')
               .setPlaceholder('"12:32 PM EST"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('total')
               .setLabel('How long did you patrol for?')
               .setPlaceholder('"60". Must be a number, in minutes.')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('start-screenshot')
               .setLabel("Patrol's start screenshot link")
               .setStyle(TextInputStyle.Short)
               .setPlaceholder('Must be a valid link.')
               .setMaxLength(1024)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('end-screenshot')
               .setLabel("Patrol's end screenshot link")
               .setStyle(TextInputStyle.Short)
               .setPlaceholder('Must be a valid link.')
               .setMaxLength(1024)
               .setRequired(true),
         ),
      ]

      const modal = new ModalBuilder()
         .setCustomId('log-modal')
         .setTitle(`Patrol Log Submission Form`)

      modal.addComponents(...questions)

      await interaction.showModal(modal)
   },
})
