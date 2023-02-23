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
      .setName('loa')
      .setDescription('Submits a leave of absence request')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const questions: any = [
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('start')
               .setLabel('On what date will your LOA start?')
               .setPlaceholder('"MM/DD/YYYY"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('end')
               .setLabel('On what date will your LOA end?')
               .setPlaceholder('"MM/DD/YYYY"')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(25)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('reason')
               .setLabel('For what reason will you be on LOA?')
               .setStyle(TextInputStyle.Paragraph)
               .setMaxLength(1024)
               .setRequired(true),
         ),
      ]

      const modal = new ModalBuilder().setCustomId('loa-modal').setTitle(`LOA Submission Form`)

      modal.addComponents(...questions)

      return await interaction.showModal(modal)
   },
})
