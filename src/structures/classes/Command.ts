import { type SlashCommandBuilder } from 'discord.js'

interface CommandConfig {
   data: SlashCommandBuilder
   userRole?: string
   execute: Function
}

export default class Command {
   constructor(public attributes: CommandConfig) {
      this.attributes = attributes
   }
}
