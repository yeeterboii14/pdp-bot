import { PermissionsBitField, SlashCommandBuilder } from 'discord.js'
import axios from 'axios'
import ms from 'ms'
import Command from '../../structures/classes/Command.js'

const cooldowns: any = new Map()

export default new Command({
   data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Displays the Prominence District Police activity leaderboard')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const userCooldown = cooldowns.get('true')
      const cooldown = userCooldown === undefined ? 0 : userCooldown

      if (cooldown?.cooldown > Date.now()) {
         return await interaction.reply({
            content: `${interaction.user.toString()}, you must wait ${ms(
               cooldown.cooldown - Date.now(),
               {
                  long: true,
               },
            )} before refreshing the leaderboard!`,
            ephemeral: false,
         })
      }

      cooldowns.set('true', {
         cooldown: Date.now() + 600_000,
      })

      const { data: cardsOnBoard }: any = await axios.get(
         `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )

      const officersArray = new Map()

      for (const card of cardsOnBoard) {
         const splitCardName = card.name.split(' ')
         const lastWordOfCardName = splitCardName[splitCardName.length - 1]

         const oldCardArguments = card.desc.split(`---`)

         const [_, __, ___, ____, _____, patrolInfo] = oldCardArguments

         let patrolInfoArguments

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
            )
               officersArray.set(
                  lastWordOfCardName,
                  realPatrolInfoArguments[1].split(':**')[1].split(' ')[1],
               )
         }
      }

      const leaderboard = new Map([...officersArray.entries()].sort((a, b) => b[1] - a[1]))

      let description = ''
      let i = 1

      for (const [name, time] of leaderboard) {
         if (i === 11) break

         description += `**${
            i === 1
               ? ':first_place:'
               : i === 2
               ? ':second_place:'
               : i === 3
               ? ':third_place:'
               : `${i}.`
         }** ${name} — **${time} minutes**${i === 3 ? '\n\u200B\n' : '\n'}`

         i++
      }

      await interaction.reply({
         embeds: [
            new client.MessageEmbed()
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle('Activity Leaderboard')
               .setTimestamp()
               .setColor(client.default_color)
               .setDescription(description),
         ],
      })
   },
})
