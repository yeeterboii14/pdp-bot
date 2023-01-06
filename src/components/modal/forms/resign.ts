import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import ms from 'ms'
import Component from '../../../structures/classes/Component.js'

export default new Component('resign-modal', async (client: any, interaction: any) => {
   const responses = await interaction.fields

   const [month, day, year] = responses.getField('date')?.value?.split('/')

   const date = new Date(Number(year), Number(month) - 1, Number(day), 23, 59)
   const reason = responses.getField('reason')?.value || 'No reason specified'

   if (!date.getTime())
      return await interaction.reply({
         content: 'Invalid resignation date. Please use the following format: MM/DD/YYYY',
         ephemeral: true,
      })

   function formatDate(date: any) {
      var d = new Date(date),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [month, day, year].join('/')
   }

   const embed = new client.MessageEmbed()
      .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
      .setTitle('Resignation Notice')
      .setTimestamp()
      .setColor(client.default_color)
      .setAuthor({
         name: `${interaction.member.displayName}`,
         iconURL: interaction.user.avatarURL(),
      })
      .addFields(
         { name: 'Resignation Date', value: `${formatDate(date)}` },
         { name: 'Reason', value: reason },
      )

   const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId('resign-button-approve')
         .setLabel('Approve')
         .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
         .setCustomId('resign-button-decline')
         .setLabel('Decline')
         .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
         .setCustomId('resign-button-cancel')
         .setLabel('Cancel')
         .setStyle(ButtonStyle.Secondary),
   )

   await interaction.channel.send({
      embeds: [embed],
      components: [row],
   })

   await interaction.reply({
      content:
         'Resignation notice submitted. You will be notified once your supervisor approves or declines it.',
      ephemeral: true,
   })
})
