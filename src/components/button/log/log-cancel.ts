import Component from '../../../structures/classes/Component.js'

export default new Component('log-button-cancel', async (client: any, interaction: any) => {
   let authorName = ''

   await interaction.message.embeds.forEach(async (embed: any) => {
      authorName = embed.author.name
   })

   const foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.displayName === authorName,
   )

   if (foundUser.user.id !== interaction.user.id)
      return await interaction.reply({
         content: `You can only cancel your own patrol log!`,
         ephemeral: true,
      })

   await interaction.message.delete()
})
