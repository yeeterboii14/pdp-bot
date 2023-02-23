import Component from '../../../structures/classes/Component.js'

export default new Component('ra-button-take', async (client: any, interaction: any) => {
   if (!interaction.member.roles.cache.find((role: any) => role.name === 'Public Relations'))
      return await interaction.reply({
         content: `You must be in Public Relations to take a ride-along request!`,
         ephemeral: true,
      })

   let time, foundUser, authorId: any, date: any

   await interaction.message.embeds.forEach(async (embed: any) => {
      embed.fields.forEach((field: any) => {
         if (field.name === 'User') authorId = field.value

         if (field.name === 'Preferred Date') date = field.value

         if (field.name === 'Preferred Time') time = field.value
      })
   })

   foundUser = await interaction.guild.members.cache.find(
      (member: any) => member.user.toString() === authorId,
   )

   if (!foundUser)
      return await interaction.reply({
         content: `**@${authorId}** could not be found.`,
         ephemeral: true,
      })

   const discordName = foundUser?.displayName,
      splitName = discordName?.split(' '),
      username = splitName[splitName?.length - 1]

   await foundUser
      .send({
         embeds: [
            new client.MessageEmbed()
               .setDescription(
                  `${client.default_check_pos} Your ride-along request has been taken. The officer will message you shortly.`,
               )
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`Ride-along Request Taken`)
               .setTimestamp()
               .setColor(client.default_color)
               .addFields({ name: 'Officer', value: interaction.member.displayName }),
         ],
      })
      .catch((_: any) => {
         console.log(`${username} blocked his dms`)
      })

   await interaction.message.edit({
      content: `${
         client.default_check_pos
      } Ride-along request taken by ${interaction.member.user.toString()}.`,
      components: [],
   })

   await interaction.reply({
      content: `The user received a message regarding the ride-along request.`,
      ephemeral: true,
   })
})
