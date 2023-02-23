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
      .setName('ride-along')
      .setDescription('Submits a ride-along request')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),

   async execute(client: any, interaction: any) {
      if (!interaction.member.roles.cache.find((role: any) => role.name === 'Citizen'))
         return await interaction.reply({
            content: `You must have the Citizen role in this server to submit a ride-along request!`,
            ephemeral: true,
         })

      const questions: any = [
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('date')
               .setLabel('When do you plan on taking the ride-along?')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(50)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('time')
               .setLabel('What time and time zone works better for you?')
               .setStyle(TextInputStyle.Short)
               .setMaxLength(50)
               .setRequired(true),
         ),
         new ActionRowBuilder().addComponents(
            new TextInputBuilder()
               .setCustomId('officer')
               .setLabel('Do you have any specific officer in mind?')
               .setPlaceholder('Leave blank if none.')
               .setStyle(TextInputStyle.Paragraph)
               .setMaxLength(100)
               .setRequired(false),
         ),
      ]

      const modal = new ModalBuilder().setCustomId('ra-modal').setTitle(`Ride-along Request Form`)

      modal.addComponents(...questions)

      return await interaction.showModal(modal)
   },
})
