import { PermissionsBitField, SlashCommandBuilder } from 'discord.js'
import axios from 'axios'
import Command from '../../structures/classes/Command.js'

export default new Command({
   data: new SlashCommandBuilder()
      .setName('card')
      .setDescription('Displays your trello card in the activity database')
      .setDefaultMemberPermissions(PermissionsBitField.Flags.SendMessages)
      .addUserOption((option: any) =>
         option.setName('user').setDescription('The department employee'),
      )
      .setDMPermission(false),
   userRole: 'Department Employee',

   async execute(client: any, interaction: any) {
      const userOption = interaction.options.get('user')
      const member = userOption ? userOption.member : interaction.member

      const discordName = member.displayName,
         splitName = discordName.split(' '),
         username = splitName[splitName.length - 1]

      const { data: cardsOnBoard }: any = await axios.get(
         `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
      )

      let targetCard: any

      for (const item of cardsOnBoard) {
         const splitCardName = item.name.split(' ')
         const lastWordOfCardName = splitCardName[splitCardName.length - 1]

         if (lastWordOfCardName.toLowerCase() === username.toLowerCase()) {
            targetCard = item
            break
         }
      }

      if (!targetCard)
         return await interaction.reply({
            content: `${
               member === interaction.member ? 'Your' : `${member.user.toString()}'s`
            } trello card could not be located on the database. Please ensure ${
               member === interaction.member ? 'your' : `their`
            } display name is the same as ${
               member === interaction.member ? 'your' : `their`
            } trello card.`,
            ephemeral: true,
         })

      const cardDescription = targetCard.desc
      const oldCardArguments = cardDescription.split(`---`)

      const [_, profLink, actionHistory, patrolHistory, overtimeEvents, patrolInfo] =
         oldCardArguments

      await interaction.reply({
         embeds: [
            new client.MessageEmbed()
               .setDescription(
                  `${profLink.trim()}\n\u200B\n${actionHistory.trim()}\n\u200B\n${patrolHistory.trim()}\n\u200B\n${overtimeEvents.trim()}\n\u200B\n${patrolInfo.trim()}`,
               )
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`${username}'s Activity Database Card`)
               .setTimestamp()
               .setColor(client.default_color),
         ],
      })
   },
})
