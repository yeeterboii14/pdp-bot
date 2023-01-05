import cron from 'cron'
import axios from 'axios'

export default async function (client: any) {
   return new cron.CronJob(
      '59 23 * * 0',
      async function () {
         const { data: cardsOnBoard }: any = await axios.get(
            `https://api.trello.com/1/boards/${process.env.TRELLO_BOARD_ID}/cards?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
         )

         let squad1 = 0,
            squad2 = 0,
            squad3 = 0,
            k9 = 0,
            hicom = 0,
            command = 0

         const squad1Map = new Map()
         const squad2Map = new Map()
         const squad3Map = new Map()
         const k9Map = new Map()
         const hicomMap = new Map()
         const commandMap = new Map()

         for (const card of cardsOnBoard) {
            const splitCardName = card.name.split(' ')
            const lastWordOfCardName = splitCardName[splitCardName.length - 1]

            const oldCardArguments = card.desc.split(`---`)

            const [_, profLink, actionHistory, patrolHistory, overtimeEvents, patrolInfo] =
               oldCardArguments

            let patrolInfoArguments

            let logsToChangeNumb = 0,
               timeToChangeNumb = 0,
               quotaLogs = 0,
               quotaTime = 0

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
               ) {
                  logsToChangeNumb = realPatrolInfoArguments[0].split(':**')[1]
                  timeToChangeNumb = realPatrolInfoArguments[1].split(':**')[1].split(' ')[1]
                  quotaLogs = realPatrolInfoArguments[2].split(':**')[1]
                  quotaTime = realPatrolInfoArguments[3].split(':**')[1].split(' ')[1]
               }

               const changedPatrolTime = Number(timeToChangeNumb),
                  changedLogs = Number(logsToChangeNumb),
                  changedQuotaLogs = 0,
                  changedQuotaTime = 0

               const updatedDescripCard = `---${profLink}---${actionHistory}---${patrolHistory}---${overtimeEvents}---\n**Total Logs:** ${changedLogs}\n**Total Time:** ${changedPatrolTime} minutes\n**Quota Logs:** ${changedQuotaLogs} \n**Quota Time:** ${changedQuotaTime} minutes\n\n---`

               const unit = card.labels.find(
                  (label: any) =>
                     label?.name === 'K9 Unit' ||
                     label?.name === 'Squad 1' ||
                     label?.name === 'Squad 2' ||
                     label?.name === 'Squad 3' ||
                     label?.name === 'High Command' ||
                     label?.name === 'Sergeant',
               )

               if (unit?.name === 'K9 Unit') {
                  k9 += Number(quotaTime)
                  k9Map.set(lastWordOfCardName, quotaTime)
               }

               if (unit?.name === 'Squad 1') {
                  squad1 += Number(quotaTime)
                  squad1Map.set(lastWordOfCardName, quotaTime)
               }

               if (unit?.name === 'Squad 2') {
                  squad2 += Number(quotaTime)
                  squad2Map.set(lastWordOfCardName, quotaTime)
               }

               if (unit?.name === 'Squad 3') {
                  squad3 += Number(quotaTime)
                  squad3Map.set(lastWordOfCardName, quotaTime)
               }

               if (unit?.name === 'High Command') {
                  hicom += Number(quotaTime)
                  hicomMap.set(lastWordOfCardName, quotaTime)
               }

               if (unit?.name === 'Sergeant') {
                  command += Number(quotaTime)

                  commandMap.set(lastWordOfCardName, quotaTime)
               }

               await axios
                  .put(
                     `https://api.trello.com/1/cards/${card.id}?key=${process.env.TRELLO_API_KEY}&token=${process.env.TRELLO_API_TOKEN}`,
                     { desc: updatedDescripCard },
                  )
                  .catch((err: any) => console.log('error reseting quota'))
            }
         }

         const sq1lb = new Map([...squad1Map.entries()].sort((a, b) => b[1] - a[1]))
         const sq2lb = new Map([...squad2Map.entries()].sort((a, b) => b[1] - a[1]))
         const sq3lb = new Map([...squad3Map.entries()].sort((a, b) => b[1] - a[1]))
         const k9lb = new Map([...k9Map.entries()].sort((a, b) => b[1] - a[1]))
         const comlb = new Map([...commandMap.entries()].sort((a, b) => b[1] - a[1]))
         const hicomlb = new Map([...hicomMap.entries()].sort((a, b) => b[1] - a[1]))

         let sq1 = '',
            sq2 = '',
            sq3 = '',
            k9d = '',
            com = '',
            hi = ''

         const mainServer = await client.guilds.cache.get('1012366064337821766')
         const logsChannel = await mainServer.channels.cache.find(
            (c: any) => c.id === '1054127203731898398',
         )

         const quotaEmbed: any = (name: string, description: string, totalTime: any) =>
            new client.MessageEmbed()
               .setFooter({ text: `PDP Automation`, iconURL: client.user.avatarURL() })
               .setTitle(`${name} Activity Report`)
               .setTimestamp()
               .setColor(client.default_color)
               .setDescription(
                  `All quotas for this week for **${name}** were reset successfully, bringing the total time to **${totalTime} minutes.**\n\u200B\n${description}`,
               )

         let i1 = 0,
            i2 = 0,
            i3 = 0,
            i4 = 0,
            i5 = 0,
            i6 = 0

         for (const [name, time] of sq1lb) {
            i1++
            sq1 += `**${i1}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }
         for (const [name, time] of sq2lb) {
            i2++
            sq2 += `**${i2}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }
         for (const [name, time] of sq3lb) {
            i3++
            sq3 += `**${i3}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }
         for (const [name, time] of k9lb) {
            i4++
            k9d += `**${i4}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }
         for (const [name, time] of comlb) {
            i5++
            com += `**${i5}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }
         for (const [name, time] of hicomlb) {
            i6++
            hi += `**${i6}.** ${name} — **${time} minutes** ${
               time >= 45 ? ':white_check_mark:' : ':x:'
            }\n`
         }

         if (logsChannel) {
            await logsChannel.send({
               content: '<@&1033121989948346450>',
               embeds: [quotaEmbed('Squad 1', sq1, squad1)],
            })

            await logsChannel.send({
               content: '<@&1033121975889035314>',
               embeds: [quotaEmbed('Squad 2', sq2, squad2)],
            })

            await logsChannel.send({
               content: '<@&1035630980892995674>',
               embeds: [quotaEmbed('Squad 3', sq3, squad3)],
            })

            await logsChannel.send({
               content: '<@&1012367016872657058>',
               embeds: [quotaEmbed('K9 Unit', k9d, k9)],
            })

            await logsChannel.send({
               content: '<@&1012366644653342740>',
               embeds: [quotaEmbed('Command', com, command)],
            })

            await logsChannel.send({
               content: '<@&1012386091933905036>',
               embeds: [quotaEmbed('High Command', hi, hicom)],
            })
         }
      },
      null,
      false,
      'America/New_York',
   )
}
