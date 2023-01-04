import { Collection, type Client } from 'discord.js'
import Command from '../structures/classes/Command.js'

export default async function (client: Client, commandsCollection: Collection<string, Command>) {
   const array: any = new Collection()

   for (const [_, command] of commandsCollection)
      array.set(command.attributes.data.name, command.attributes.data)

   try {
      await client.application?.commands.set(array, '1033747323257372702')
   } catch (error) {
      console.log(`Slash Commands Error`, error)
   }
}
