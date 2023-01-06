import Component from '../../../structures/classes/Component.js'
import { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js'

export default new Component('resign-button-decline', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to decline a resignation notice!`,
         ephemeral: true,
      })

   let authorName = '',
      totalTime: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      authorName = embed.author.name
   })

   const foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.displayName === authorName,
   )

   const dropdownMenu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
         .setCustomId('decline-selection')
         .setPlaceholder('Select a reason')
         .addOptions(
            {
               label: 'Invalid date',
               description: 'The resignation date is invalid or unreasonable.',
               value: 'first_option',
            },
            {
               label: 'Undisclosed reason',
               description:
                  'The reason of their resignation notice being declined will not be disclosed with them.',
               value: 'second_option',
            },
            {
               label: 'Other',
               description:
                  'The reason of their resignation notice being declined is not on this list.',
               value: 'third_option',
            },
         ),
   )

   const sentMessage = await interaction.reply({
      content: `Select the reason you want to decline ${foundUser.user.toString()}'s resignation notice on the dropdown menu below.`,
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
         reason = 'Invalid or unreasonable date'
      }
      if (value === 'second_option') {
         reason = 'No reason provided'
      }
      if (value === 'third_option') {
         reason = 'Other'
      }

      await foundUser
         .send({
            embeds: [
               new client.MessageEmbed()
                  .setDescription(`:x: Your resignation notice has been declined.`)
                  .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
                  .setTitle(`Resignation Notice Declined`)
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
         content: `:x: Resignation notice declined by ${interaction.user.toString()}.`,
         components: [],
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      return await interaction.deleteReply()
   })
})
