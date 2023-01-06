import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'
import ms from 'ms'
import Component from '../../../structures/classes/Component.js'

export default new Component('loa-modal', async (client: any, interaction: any) => {
   const responses = await interaction.fields

   const [month1, day1, year1] = responses.getField('start')?.value?.split('/')
   const [month2, day2, year2] = responses.getField('end')?.value?.split('/')

   const startDate = new Date(Number(year1), Number(month1) - 1, Number(day1), 0, 1)
   const endDate = new Date(Number(year2), Number(month2) - 1, Number(day2), 23, 59)

   if (!startDate.getTime() || !endDate.getTime())
      return await interaction.reply({
         content: 'Invalid start/end date. Please use the following format: MM/DD/YYYY',
         ephemeral: true,
      })

   const duration = ms(Math.round(endDate.getTime() - startDate.getTime()), {
      long: true,
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
      .setTitle('Leave of Absence Request')
      .setTimestamp()
      .setColor(client.default_color)
      .setAuthor({
         name: `${interaction.member.displayName}`,
         iconURL: interaction.user.avatarURL(),
      })
      .addFields(
         { name: 'Start Date', value: `${formatDate(startDate)}` },
         { name: 'End Date', value: `${formatDate(endDate)}` },
         { name: 'Reason', value: responses.getField('reason').value },
         { name: 'Duration', value: `${duration}` },
      )

   const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId('loa-button-approve')
         .setLabel('Approve')
         .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
         .setCustomId('loa-button-decline')
         .setLabel('Decline')
         .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
         .setCustomId('loa-button-cancel')
         .setLabel('Cancel')
         .setStyle(ButtonStyle.Secondary),
   )

   await interaction.channel.send({
      embeds: [embed],
      components: [row],
   })

   await interaction.reply({
      content:
         'Leave of absence submitted. You will be notified once your supervisor approves or declines it.',
      ephemeral: true,
   })
})
