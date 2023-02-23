import Component from '../../../structures/classes/Component.js'
import { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js'

export default new Component('ra-button-decline', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Public Relations'))
      return await interaction.reply({
         content: `You must be in Public Relations to decline a ride-along request!`,
         ephemeral: true,
      })

   let authorId = ''

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'User') authorId = field.value
      })
   })

   const foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.user.toString() === authorId,
   )

   if (!foundUser)
      return await interaction.reply({
         content: `**@${authorId}** could not be found.`,
         ephemeral: true,
      })

   const dropdownMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId('decline-selection')
         .setPlaceholder('Select a reason')
         .addOptions(
            {
               label: 'Invalid date',
               description: 'The ride-along date is invalid or unreasonable.',
               value: 'first_option',
            },

            {
               label: 'Lengthy record list',
               description: 'The user has too many records.',
               value: 'second_option',
            },
            {
               label: 'Undisclosed reason',
               description:
                  'The reason of their ride-along request being declined will not be disclosed with them.',
               value: 'third_option',
            },
            {
               label: 'Other',
               description:
                  'The reason of their ride-along request being declined is not on this list.',
               value: 'fourth_option',
            },
         ),
   )

   const sentMessage = await interaction.reply({
      content: `Select the reason you want to decline ${foundUser.user.toString()}'s ride-along request on the dropdown menu below.`,
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

      if (value === 'first_option') reason = 'Invalid or unreasonable date'

      if (value === 'second_option') reason = 'Lengthy record list'

      if (value === 'fourth_option') reason = 'No reason provided'

      if (value === 'third_option') reason = 'Other'

      await foundUser
         .send({
            embeds: [
               new client.MessageEmbed()
                  .setDescription(
                     `${client.default_check_neg} Your ride-along request has been declined.`,
                  )
                  .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
                  .setTitle(`Ride-along Request Declined`)
                  .setTimestamp()
                  .setColor(client.default_color)
                  .addFields(
                     { name: 'Reason', value: reason },
                     { name: 'Officer Signature', value: interaction.member.displayName },
                  ),
            ],
         })
         .catch((_: any) => {
            console.log(`${authorId} blocked his dms`)
         })

      await interaction.message.edit({
         content: `${
            client.default_check_neg
         } Ride-along request declined by ${interaction.user.toString()}.`,
         components: [],
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      return await interaction.deleteReply()
   })
})
