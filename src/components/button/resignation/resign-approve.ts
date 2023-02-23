import axios from 'axios'
import Component from '../../../structures/classes/Component.js'

export default new Component('resign-button-approve', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Supervisor'))
      return await interaction.reply({
         content: `You must be a Supervisor to approve a resignation notice!`,
         ephemeral: true,
      })

   let reason, foundUser, authorName: any, date: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'Resignation Date') date = field.value

         if (field.name === 'Reason') reason = field.value
      })
      authorName = embed.author.name
   })

   const [month, day, year] = date?.split('/')

   date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), 23, 59))

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

   const newCardFormat = `**PROMINENCE DISTRICT POLICE: RESIGNATION NOTICE**%0A________________________________________________________________________%0A**NAME:**%0A> ${username} %0A%0A**RANK:**%0A > ${
      rankRole ? rankRole.name : 'Unknown'
   }%0A%0A**CALLSIGN:**%0A > ${callsign}%0A%0A**APPROVAL DATE:**%0A > ${formatDate(
      new Date(),
   )}%0A%0A**RESIGNATION DATE:**%0A > ${formatDate(
      date,
   )}%0A%0A**REASON:**%0A > ${reason}%0A%0A**SUPERVISOR SIGNATURE:**%0A > ${
      interaction.member.displayName
   }%0A`

   cardId = targetCard.id

   try {
      await axios.post(
         `https://api.trello.com/1/cards/${cardId}/actions/comments?text=${newCardFormat}&key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )

      await axios.put(
         `https://api.trello.com/1/cards/${cardId}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
         { due: date, start: null },
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
                  `${client.default_check_pos} Your resignation notice has been approved. A member of the department's High Command will be in touch shortly.`,
               )
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`Resignation Notice Approved`)
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
      } Resignation notice approved by ${interaction.member.user.toString()}.`,
      components: [],
   })

   await interaction.message.reply({ content: '<@&1012386091933905036>' })
})
