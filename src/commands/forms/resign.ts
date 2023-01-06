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
      .setName('resign')
      .setDescription('Submits a resignation notice')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const questions: any = [
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('date')
               .setLabel('When will you resign effectively?')
               .setPlaceholder('"MM/DD/YYYY"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('reason')
               .setLabel('For what reason do you want to resign?')
               .setPlaceholder('Optional')
               .setStyle(TextInputStyle.Paragraph)
               .setMaxLength(1024)
               .setRequired(false),
         ),
      ]

      const modal = new ModalBuilder()
         .setCustomId('resign-modal')
         .setTitle(`Resignation Submission Form`)

      modal.addComponents(...questions)

      await interaction.showModal(modal)
   },
})
