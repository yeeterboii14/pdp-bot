import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import Component from '../../../structures/classes/Component.js'

export default new Component('log-modal', async (client: any, interaction: any) => {
   const responses = interaction.fields

   const embed = new client.MessageEmbed()
      .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
      .setTimestamp()
      .setColor(client.default_color)
      .setAuthor({
         name: `${interaction.member.displayName}`,
         iconURL: interaction.user.avatarURL(),
      })
      .addFields(
         { name: 'Start Time', value: responses.getField('start').value },
         { name: 'End Time', value: responses.getField('end').value },
         { name: 'Total Patrol Time', value: responses.getField('total').value },
         {
            name: 'Start Screenshot',
            value: `[Start Screenshot Link](${responses.getField('start-screenshot').value})`,
         },
         {
            name: 'End Screenshot',
            value: `[End Screenshot Link](${responses.getField('end-screenshot').value})`,
         },
      )

   const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId('log-button-approve')
         .setLabel('Approve')
         .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
         .setCustomId('log-button-decline')
         .setLabel('Decline')
         .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
         .setCustomId('log-button-cancel')
         .setLabel('Cancel')
         .setStyle(ButtonStyle.Secondary),
   )

   await interaction.channel.send({
      embeds: [embed],
      components: [row],
   })

   await interaction.reply({
      content:
         'Patrol log submitted. You will be notified once your supervisor approves or declines it.',
      ephemeral: true,
   })
})
