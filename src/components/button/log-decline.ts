import Component from '../../structures/classes/Component.js'
import { ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js'

export default new Component('log-button-decline', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to decline patrol logs.`,
         ephemeral: true,
      })

   let authorName = '',
      totalTime: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      for (const field of embed.fields)
         if (field.name === 'Total Patrol Time') totalTime = field.value

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
               label: 'Invalid Proof',
               description: 'The patrol proof is invalid.',
               value: 'first_option',
            },
            {
               label: 'Patrol is too short',
               description: "The patrol didn't meet the minimum log requirement",
               value: 'second_option',
            },
            {
               label: 'Too many logs submitted',
               description: 'The officer submitted too many logs in a day, surpassing the limit.',
               value: 'third_option',
            },
            {
               label: 'Not Disclosed Reason',
               description:
                  'The reason of their patrol being declined will not be disclosed with them.',
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
      content: `Select the reason you want to decline ${foundUser.user.toString()}'s log on the dropdown menu below.`,
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
         reason = 'Invalid proof'
      }
      if (value === 'second_option') {
         reason = 'Patrol length does not meet minimum standards'
      }
      if (value === 'third_option') {
         reason = 'Too many logs submitted within one day, exceeding the daily limit.'
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
                     `:x: Your patrol log lasting **${totalTime} minutes** has been declined.`,
                  )
                  .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
                  .setTitle(`Patrol Log Declined`)
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
         content: `Patrol declined by ${interaction.user.toString()}.`,
         components: [],
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      return await interaction.deleteReply()
   })
})
