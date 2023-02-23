import Event from '../../structures/classes/Event.js'

export default new Event('interactionCreate', async (client: any, interaction: any) => {
   if (interaction.user.bot) return

   if (interaction.isSelectMenu()) {
      const select = client.selectMenusCollection.get(interaction.customId)

      if (select) return select(client, interaction)
   }

   if (interaction.isModalSubmit()) {
      const modal = client.modalsCollection.get(interaction.customId)

      if (modal) return modal(client, interaction)
   }

   if (interaction.isButton()) {
      const button = client.buttonsCollection.get(interaction.customId)

      if (button) button(client, interaction)
   }

   if (!interaction.isCommand()) return

   const { attributes: command } = client.commandsCollection.get(interaction.commandName)

   const userRole = interaction.member.roles.cache.find(
      (role: any) => role.name === command?.userRole,
   )

   if (!userRole && command?.userRole) {
      return await interaction.reply({
         content: `You don't have enough permissions to execute this command!`,
         ephemeral: true,
      })
   }

   command.execute(client, interaction)
})
