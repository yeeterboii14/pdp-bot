import { ActivityType } from 'discord.js'
import chalk from 'chalk'
import axios from 'axios'
import Event from '../../structures/classes/Event.js'
import loadCommands from '../../utils/load-commands.js'

export default new Event('ready', async (client: any) => {
   console.log(chalk.blue(`[DISCORD] ${client.user.username} is running`))

   await loadCommands(client, client.commandsCollection)

   setInterval(async () => {
      const { data: groupData } = await axios.get('https://groups.roblox.com/v1/groups/4431799')

      const status = {
         activities: [
            {
               name: `${groupData ? Number(groupData.memberCount) - 1 : '100k'} Officers`,
               type: ActivityType.Watching,
            },
         ],
         status: 'online',
      }

      client.user.setPresence(status)
   }, 60_000)
})
