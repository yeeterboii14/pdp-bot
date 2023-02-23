import Component from '../../../structures/classes/Component.js'
import { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js'

export default new Component('loa-button-decline', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to decline a leave of absence!`,
         ephemeral: true,
      })

   let authorName = '',
      startDate = '',
      endDate = ''

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'Start Date') {
            startDate = field.value
         }

         if (field.name === 'End Date') {
            endDate = field.value
         }
      })

      authorName = embed.author.name
   })

   const foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.displayName === authorName,
   )

   if (!foundUser)
      return await interaction.reply({
         content: `**@${authorName}** could not be found.`,
         ephemeral: true,
      })

   const dropdownMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId('loa-decline-selection')
         .setPlaceholder('Select a reason')
         .addOptions(
            {
               label: 'Invalid dates',
               description: 'The dates provided are invalid.',
               value: 'first_option',
            },
            {
               label: 'Leave of absence is too long',
               description: 'The LOA exceeds the maximum days allowed.',
               value: 'second_option',
            },
            {
               label: 'Too many LOAs submitted',
               description:
                  'The officer submitted too many LOAS within the month, surpassing the limit.',
               value: 'third_option',
            },
            {
               label: 'Undisclosed reason',
               description:
                  'The reason of their LOA being declined will not be disclosed with them.',
               value: 'fourth_option',
            },
            {
               label: 'Other',
               description: 'The reason of their patrol being declined is not on this list.',
               value: 'fifth_option',
            },
         ),
   )

   const sentMessage = await interaction.reply({
      content: `Select the reason you want to decline ${foundUser.user.toString()}'s LOA on the dropdown menu below.`,
      components: [dropdownMenu],
      ephemeral: true,
      fetchReply: true,
   })

   const filter = async (i: any) => {
      await i.deferUpdate()
      return i.user.id === interaction.user.id
   }

   let reason = 'None'

   const collector = await sentMessage.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
      time: 600_000,
      max: 1,
      maxProcessed: 1,
   })

   await collector.on('collect', async (data: any) => {
      const value = data.values[0]

      if (value === 'first_option') {
         reason = 'Invalid dates'
      }
      if (value === 'second_option') {
         reason = 'LOA exceeds maximum allotted days'
      }
      if (value === 'third_option') {
         reason = 'Too many LOAs submitted this month'
      }
      if (value === 'fourth_option') {
         reason = 'No reason provided'
      }
      if (value === 'fifth_option') {
         reason = 'Other'
      }

      await foundUser
         .send({
            embeds: [
               new client.MessageEmbed()
                  .setDescription(
                     `${client.default_check_neg} Your leave of absence starting on **${startDate}** and ending on **${endDate}** has been declined.`,
                  )
                  .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
                  .setTitle(`Leave of Absence Declined`)
                  .setTimestamp()
                  .setColor(client.default_color)
                  .addFields(
                     { name: 'Reason', value: reason },
                     { name: 'Supervisor Signature', value: interaction.member.displayName },
                  ),
            ],
         })
         .catch((_: any) => {
            console.log(`${authorName} blocked his dms`)
         })

      await interaction.message.edit({
         content: `${
            client.default_check_neg
         } Leave of Absence declined by ${interaction.user.toString()}.`,
         components: [],
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      return await interaction.deleteReply()
   })
})
