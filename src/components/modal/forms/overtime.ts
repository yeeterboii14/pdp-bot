import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js'
import axios from 'axios'
import Component from '../../../structures/classes/Component.js'

export default new Component('overtime-modal', async (client: any, interaction: any) => {
   const responses = await interaction.fields

   const [month, day, year] = responses.getField('date')?.value?.split('/')

   const date = new Date(Number(year), Number(month) - 1, Number(day), 0, 1)
   const employee = responses.getField('employee').value
   const event = responses.getField('event').value

   if (!date.getTime())
      return await interaction.reply({
         content: 'Invalid event date. Please use the following format: MM/DD/YYYY',
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

   const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
         .setCustomId('overtime-button-confirm')
         .setLabel('Confirm')
         .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
         .setCustomId('overtime-button-cancel')
         .setLabel('Cancel')
         .setStyle(ButtonStyle.Secondary),
   )

   let foundUser: any

   foundUser = await interaction.guild.members.cache.find((member: any) =>
      member.displayName.includes(employee),
   )

   if (!foundUser)
      return await interaction.reply({
         content: `**@${employee}** could not be found.`,
         ephemeral: true,
      })

   const discordName = foundUser?.displayName,
      splitName = discordName?.split(' '),
      username = splitName[splitName.length - 1],
      callsign = splitName[0]

   const message = await interaction.reply({
      content: `Are you sure you want to add event **${event}** that happened at **${formatDate(
         date,
      )}** to **${username}**'s card?`,
      components: [row],
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

      if (value === 'overtime-button-cancel') return await interaction.deleteReply()

      const { data: cardsOnBoard }: any = await axios.get(
         `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )

      let targetCard: any, cardId: string

      for (const item of cardsOnBoard) {
         const splitCardName = item.name.split(' ')
         const lastWordOfCardName = splitCardName[splitCardName.length - 1]

         if (lastWordOfCardName.toLowerCase() === username.toLowerCase()) targetCard = item
      }

      if (!targetCard)
         return await interaction.editReply({
            content: `${foundUser.user.toString()}'s trello card could not be located on the database. Please ensure their display name is the same as their trello card.`,
            ephemeral: true,
         })

      const rankRole = foundUser.roles.cache.find(
         (role: any) =>
            role.name.includes('Chief of Police') ||
            role.name.includes('Assistant Chief of Police') ||
            role.name.includes('Lieutenant') ||
            role.name.includes('Sergeant') ||
            role.name.includes('Corporal') ||
            role.name.includes('Officer') ||
            role.name.includes('Recruit'),
      )

      const newCardFormat = `**PROMINENCE DISTRICT POLICE: OVERTIME EVENT**%0A________________________________________________________________________%0A**NAME:**%0A> ${username} %0A%0A**RANK:**%0A > ${
         rankRole ? rankRole.name : 'Unknown'
      }%0A%0A**CALLSIGN:**%0A > ${callsign}%0A%0A**EVENT DATE:**%0A > ${formatDate(
         date,
      )} %0A%0A**EVENT NAME:**%0A > ${event} %0A%0A**SUPERVISOR SIGNATURE:**%0A > ${
         interaction.member.displayName
      }%0A`

      cardId = targetCard.id

      const cardDescription = targetCard.desc
      const oldCardArguments = cardDescription.split(`---`)

      const [_, profLink, actionHistory, patrolHistory, overtimeEvents, patrolInfo] =
         oldCardArguments

      const updatedOvertimeEvent = `${overtimeEvents} \n - ${formatDate(date)} - ${event}\n\n`

      const updatedDescripCard = `---${profLink}---${actionHistory}---${patrolHistory}---${updatedOvertimeEvent}---${patrolInfo}---`

      try {
         await axios.put(
            `https://api.trello.com/1/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
            { desc: updatedDescripCard },
         )

         await axios.post(
            `https://api.trello.com/1/cards/${cardId}/actions/comments?text=${newCardFormat}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
         )
      } catch {
         return await interaction.editReply({
            content: `An unexpected error occurred. Contact invalidforce or yeeterboii14.`,
            ephemeral: true,
         })
      }

      await foundUser
         .send({
            embeds: [
               new client.MessageEmbed()
                  .setDescription(
                     `:white_check_mark: Event **${event}** that happened at **${formatDate(
                        date,
                     )}** was added to your card.`,
                  )
                  .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
                  .setTitle(`Overtime Event Added`)
                  .setTimestamp()
                  .setColor(client.default_color)
                  .addFields({
                     name: 'Supervisor Signature',
                     value: interaction.member.displayName,
                  }),
            ],
         })
         .catch((_: any) => {
            console.log(`${username} blocked his dms`)
         })

      await interaction.editReply({
         content: `Overtime event **${event}** that happened at **${formatDate(
            date,
         )}** was added to **${username}'s** card.`,
         components: [],
      })
   })

   await collector.on('end', async (_: any, reason: string) => {
      if (reason === 'time') return await interaction.deleteReply()
   })
})
