import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'
import Component from '../../../structures/classes/Component.js'

export default new Component('ra-modal', async (client: any, interaction: any) => {
   const responses = await interaction.fields

   const embed1 = new client.MessageEmbed()
      .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
      .setTitle('Ride-along Terms & Conditions')
      .setDescription(
         `1. Do you understand by partaking in a ride-along PDP is not held responsible for any injuries or death?\n2. Do you understand the ride-along can end at any time at the officer's discretion?\n 3. Do you agree to listen to the officer's commands at all times?\n  4. Do you agree not to talk to any suspects?\n 5. Do you agree to stay behind the officer unless told otherwise?`,
      )
      .setTimestamp()
      .setColor(client.default_color)

   const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId('ra-button-accept')
         .setLabel('Accept Terms & Conditions')
         .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
         .setCustomId('ra-button-cancel')
         .setLabel('Cancel')
         .setStyle(ButtonStyle.Secondary),
   )

   const message = await interaction.reply({
      embeds: [embed1],
      components: [row1],
      ephemeral: true,
      fetchReply: true,
   })

   const filter = async (i: any) => {
      await i.deferUpdate()
      return i.user.id === interaction.user.id
   }

   const collector = await message.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      time: 300_000,
      max: 1,
      maxProcessed: 1,
   })

   await collector.on('collect', async (data: any) => {
      const value = data.customId

      if (value === 'ra-button-cancel') return await interaction.deleteReply()

      const embed2 = new client.MessageEmbed()
         .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
         .setTitle('Ride-along Request')
         .setTimestamp()
         .setColor(client.default_color)
         .addFields(
            { name: 'User', value: interaction.user.toString() },
            { name: 'Preferred Date', value: responses.getField('date')?.value },
            { name: 'Preferred Time', value: responses.getField('time')?.value },
            { name: 'Preferred Officer', value: responses.getField('officer')?.value || 'Anyone' },
         )

      const row2 = new ActionRowBuilder().addComponents(
         new ButtonBuilder()
            .setCustomId('ra-button-take')
            .setLabel('Take')
            .setStyle(ButtonStyle.Success),
         new ButtonBuilder()
            .setCustomId('ra-button-decline')
            .setLabel('Decline')
            .setStyle(ButtonStyle.Danger),
      )

      const mainServer = await client.guilds.cache.get('1033747323257372702')
      const raChannel = await mainServer.channels.cache.find(
         (c: any) => c.id === '1062036200019468348',
      )

      if (raChannel)
         await raChannel.send({
            embeds: [embed2],
            components: [row2],
         })

      await interaction.editReply({
         content: `Ride-along request submitted. You will be notified once an officer takes your request. Allow direct messages from this server.`,
         embeds: [],
         components: [],
         ephemeral: true,
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      if (reason === 'time') return await interaction.deleteReply()
   })
})
