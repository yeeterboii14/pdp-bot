import { Client, Collection, IntentsBitField, EmbedBuilder } from 'discord.js'
import { readdirSync } from 'node:fs'

export default class Bot extends Client {
   constructor() {
      super({
         intents: [
            IntentsBitField.Flags.Guilds,
            IntentsBitField.Flags.GuildMembers,
            IntentsBitField.Flags.GuildMessages,
            IntentsBitField.Flags.GuildPresences,
            IntentsBitField.Flags.MessageContent,
            IntentsBitField.Flags.DirectMessages,
         ],
      })
   }

   public readonly commandsCollection = new Collection()
   public readonly selectMenusCollection = new Collection()
   public readonly modalsCollection = new Collection()
   public readonly buttonsCollection = new Collection()
   public readonly MessageEmbed = EmbedBuilder
   public readonly default_color = '#c1a868'

   protected async importFile(filePath: string) {
      const importedFile = await import(filePath)
      return importedFile?.default
   }

   protected async commandHandler() {
      for (const file of readdirSync('src/commands/')) {
         readdirSync(`src/commands/${file}/`).forEach(async (c) => {
            const command = await this.importFile(
               `../../commands/${file}/${c.replace(/.ts/, '.js')}`,
            )

            this.commandsCollection.set(command.attributes.data.name, command)
         })
      }
   }

   protected async eventHandler() {
      for (const file of readdirSync('src/events/')) {
         readdirSync(`src/events/${file}/`).forEach(async (eventFile) => {
            const event = await this.importFile(
               `../../events/${file}/${eventFile.replace(/.ts/, '.js')}`,
            )

            this.on(event.event, event.execute.bind(undefined, this))
         })
      }
   }

   protected async componentHandler() {
      for (const file of readdirSync('src/components/')) {
         readdirSync(`src/components/${file}/`).forEach(async (componentFile) => {
            const component = await this.importFile(
               `../../components/${file}/${componentFile.replace(/.ts/, '.js')}`,
            )

            if (file === 'select') this.selectMenusCollection.set(component.name, component.execute)
            if (file === 'modal') this.modalsCollection.set(component.name, component.execute)
            if (file === 'button') this.buttonsCollection.set(component.name, component.execute)
         })
      }
   }

   public async run() {
      await this.eventHandler()
      await this.commandHandler()
      await this.componentHandler()
      await this.login(process.env.DISCORD_CLIENT_TOKEN)
   }
}