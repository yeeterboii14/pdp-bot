import axios from 'axios'
import Component from '../../../structures/classes/Component.js'

export default new Component('log-button-approve', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to approve a patrol log!`,
         ephemeral: true,
      })

   let startTime, endTime, startScreenshot, endScreenshot, totalTime, foundUser, authorName: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'Start Time') {
            startTime = field.value
         }

         if (field.name === 'End Time') {
            endTime = field.value
         }

         if (field.name === 'Total Patrol Time') {
            totalTime = field.value
         }

         if (field.name === 'Start Screenshot') {
            startScreenshot = field.value
         }

         if (field.name === 'End Screenshot') {
            endScreenshot = field.value
         }
      })
      authorName = embed.author.name
   })

   foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.displayName === authorName,
   )

   if (!foundUser)
      return await interaction.reply({
         content: `**@${authorName}** could not be found.`,
         ephemeral: true,
      })

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

   const newCardFormat = `**PROMINENCE DISTRICT POLICE: PATROL LOG**%0A________________________________________________________________________%0A**NAME:**%0A> ${username} %0A%0A**RANK:**%0A > ${
      rankRole ? rankRole.name : 'Unknown'
   }%0A%0A**CALLSIGN:**%0A > ${callsign}%0A%0A**APPROVAL DATE:**%0A > ${formatDate(
      new Date(),
   )}%0A%0A**START TIME:**%0A > ${startTime}%0A%0A**END TIME:**%0A > ${endTime}%0A%0A**TOTAL TIME:**%0A > ${totalTime} minutes %0A%0A **EVIDENCE:**%0A > ${startScreenshot}%0A > ${endScreenshot}%0A%0A**SUPERVISOR SIGNATURE:**%0A > ${
      interaction.member.displayName
   }%0A`

   cardId = targetCard.id

   const cardDescription = targetCard.desc
   const oldCardArguments = cardDescription.split(`---`)

   const [_, profLink, actionHistory, patrolHistory, overtimeEvents, patrolInfo] = oldCardArguments

   let patrolInfoArguments

   let logsToChangeNumb = 0,
      timeToChangeNumb = 0,
      patrolArguments4thNumb = 0,
      patrolArguments5thNumb = 0

   const realPatrolInfoArguments = []

   if (patrolInfo) {
      patrolInfoArguments = patrolInfo.split(/\r?\n/)

      for (let index = 0; index < patrolInfoArguments.length; index++)
         if (patrolInfoArguments[index] !== '')
            realPatrolInfoArguments.push(patrolInfoArguments[index])

      if (
         realPatrolInfoArguments[0] &&
         realPatrolInfoArguments[1] &&
         realPatrolInfoArguments[2] &&
         realPatrolInfoArguments[3]
      ) {
         logsToChangeNumb = realPatrolInfoArguments[0].split(':**')[1]
         timeToChangeNumb = realPatrolInfoArguments[1].split(':**')[1].split(' ')[1]
         patrolArguments4thNumb = realPatrolInfoArguments[2].split(':**')[1]
         patrolArguments5thNumb = realPatrolInfoArguments[3].split(':**')[1].split(' ')[1]
      }
   }

   const changedPatrolTime = Number(timeToChangeNumb) + Number(totalTime),
      changedLogs = Number(logsToChangeNumb) + Number('1'),
      changedQuotaLogs = Number(patrolArguments4thNumb) + Number('1'),
      changedQuotaTime = Number(totalTime) + Number(patrolArguments5thNumb)

   const updatedDescripCard = `---${profLink}---${actionHistory}---${patrolHistory}---${overtimeEvents}---\n**Total Logs:** ${changedLogs}\n**Total Time:** ${changedPatrolTime} minutes\n**Quota Logs:** ${changedQuotaLogs} \n**Quota Time:** ${changedQuotaTime} minutes\n\n---`

   try {
      await axios.put(
         `https://api.trello.com/1/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
         { desc: updatedDescripCard },
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
                  `${client.default_check_pos} Your patrol log lasting **${totalTime} minutes** has been approved, bringing your total patrol time to **${changedPatrolTime} minutes.**`,
               )
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`Patrol Log Approved`)
               .setTimestamp()
               .setColor(client.default_color)
               .addFields({ name: 'Supervisor Signature', value: interaction.member.displayName }),
         ],
      })
      .catch((_: any) => {
         console.log(`${username} blocked his dms`)
      })

   await interaction.message.edit({
      content: `${
         client.default_check_pos
      } Patrol log approved by ${interaction.member.user.toString()}.`,
      components: [],
   })
})
