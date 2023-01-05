import { PermissionsBitField, SlashCommandBuilder } from 'discord.js'
import axios from 'axios'
import Command from '../../structures/classes/Command.js'

export default new Command({
   data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('Displays the Prominence District Police activity leaderboard')
      .addStringOption((option: any) =>
         option
            .setName('type')
            .setDescription('Which leaderboard to display')
            .setRequired(true)
            .addChoices({ name: 'All Time', value: 'all' }, { name: 'Weekly', value: 'week' }),
      )
      .addStringOption((option: any) =>
         option
            .setName('unit')
            .setDescription("Which unit's leaderboard to display")
            .addChoices(
               { name: 'Squad 1', value: 'squad_1' },
               { name: 'Squad 2', value: 'squad_2' },
               { name: 'Squad 3', value: 'squad_3' },
               { name: 'K9 Unit', value: 'k9_unit' },
               { name: 'Command', value: 'command' },
               { name: 'High Command', value: 'high_command' },
            ),
      )
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const type = interaction.options.get('type')?.value
      let unit = interaction.options.get('unit')?.value

      const { data: cardsOnBoard }: any = await axios.get(
         `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )

      const officersArray = new Map()

      for (const card of cardsOnBoard) {
         const unitLabel = card.labels.find(
            (label: any) =>
               label?.name === 'K9 Unit' ||
               label?.name === 'Squad 1' ||
               label?.name === 'Squad 2' ||
               label?.name === 'Squad 3' ||
               label?.name === 'High Command' ||
               label?.name === 'Sergeant',
         )

         if (
            unit &&
            unitLabel?.name?.split(' ').join('_').toLowerCase() !==
               (unit === 'command' ? 'sergeant' : unit)
         )
            continue

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
               type === 'all'
                  ? officersArray.set(
                       lastWordOfCardName,
                       realPatrolInfoArguments[1].split(':**')[1].split(' ')[1],
                    )
                  : officersArray.set(
                       lastWordOfCardName,
                       realPatrolInfoArguments[3].split(':**')[1].split(' ')[1],
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
         }** ${name} — **${time} minutes**${i === 3 ? '\n' : '\n'}`

         i++
      }

      const unitName = unit
         ? `${unit?.split('_')[0].charAt(0).toUpperCase() + unit?.split('_')[0].slice(1)} ${
              unit?.split('_')[1]
                 ? unit?.split('_')[1].charAt(0).toUpperCase() + unit?.split('_')[1].slice(1)
                 : ''
           }`
         : ''

      await interaction.reply({
         embeds: [
            new client.MessageEmbed()
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(
                  `${unit ? unitName.trim() : ''} ${
                     type === 'all' ? 'All Time' : 'Weekly'
                  } Activity Leaderboard`,
               )
               .setTimestamp()
               .setColor(client.default_color)
               .setDescription(description),
         ],
      })
   },
})
