import axios from 'axios'
import Component from '../../../structures/classes/Component.js'

export default new Component('loa-button-approve', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to approve a leave of absence!`,
         ephemeral: true,
      })

   let startDate: any, endDate: any, duration, reason, foundUser, authorName: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'Start Date') {
            startDate = field.value
         }

         if (field.name === 'End Date') {
            endDate = field.value
         }

         if (field.name === 'Reason') {
            reason = field.value
         }

         if (field.name === 'Duration') {
            duration = field.value
         }
      })
      authorName = embed.author.name
   })

   foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.displayName === authorName,
   )

   if (!foundUser)
      return await interaction.channel.send({
         content: `**@${authorName}** could not be found.`,
         ephemeral: true,
      })

   const [month1, day1, year1] = startDate?.split('/')
   const [month2, day2, year2] = endDate?.split('/')

   startDate = new Date(Date.UTC(Number(year1), Number(month1) - 1, Number(day1), 0, 1))
   endDate = new Date(Date.UTC(Number(year2), Number(month2) - 1, Number(day2), 23, 59))

   const discordName = foundUser?.displayName,
      splitName = discordName?.split(' '),
      username = splitName[splitName?.length - 1],
      callsign = splitName[0]

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
      return await interaction.channel.send({
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

   function formatDate(date: any) {
      var d = new Date(date),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear()

      if (month.length < 2) month = '0' + month
      if (day.length < 2) day = '0' + day

      return [month, day, year].join('/')
   }

   const newCardFormat = `**PROMINENCE DISTRICT POLICE: LEAVE OF ABSENCE**%0A________________________________________________________________________%0A**NAME:**%0A> ${username} %0A%0A**RANK:**%0A > ${
      rankRole ? rankRole.name : 'Unknown'
   }%0A%0A**CALLSIGN:**%0A > ${callsign}%0A%0A**APPROVAL DATE:**%0A > ${formatDate(
      new Date(),
   )}%0A%0A**START DATE:**%0A > ${formatDate(startDate)}%0A%0A**END DATE:**%0A > ${formatDate(
      endDate,
   )}%0A%0A**DURATION:**%0A > ${duration} %0A%0A**SUPERVISOR SIGNATURE:**%0A > ${
      interaction.member.displayName
   }%0A`

   cardId = targetCard.id

   const cardDescription = targetCard.desc
   const oldCardArguments = cardDescription.split(`---`)

   const [_, profLink, actionHistory, patrolHistory, overtimeEvents, patrolInfo] = oldCardArguments

   const updatedPatrolHistory = `${patrolHistory} \n - Leave of Absence (${formatDate(
      startDate,
   )} - ${formatDate(endDate)})\n\n`

   const updatedDescripCard = `---${profLink}---${actionHistory}---${updatedPatrolHistory}---${overtimeEvents}---${patrolInfo}---`

   try {
      await axios.put(
         `https://api.trello.com/1/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
         { desc: updatedDescripCard, start: startDate, due: endDate },
      )

      await axios.post(
         `https://api.trello.com/1/cards/${cardId}/actions/comments?text=${newCardFormat}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )
   } catch {
      return await interaction.channel.send({
         content: `An unexpected error occurred. Contact invalidforce or yeeterboii14.`,
         ephemeral: true,
      })
   }

   await foundUser
      .send({
         embeds: [
            new client.MessageEmbed()
               .setDescription(
                  `:white_check_mark: Your leave of absence starting on **${formatDate(
                     startDate,
                  )}** and ending on **${formatDate(
                     endDate,
                  )}** has been approved, which is a total of **${duration}** off.`,
               )
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`Leave of Absence Request Approved`)
               .setTimestamp()
               .setColor(client.default_color)
               .addFields({ name: 'Supervisor Signature', value: interaction.member.displayName }),
         ],
      })
      .catch((_: any) => {
         console.log(`${username} blocked his dms`)
      })

   await interaction.message.edit({
      content: `:white_check_mark: Leave of absence request approved by ${interaction.member.user.toString()}.`,
      components: [],
   })
})
