import dotenv from 'dotenv'
import Bot from './structures/classes/Client.js'

dotenv.config()

const client: Bot = new Bot()
client.run()

client.on('shardError', (error) => {
   console.log('shardError', error)
})

process.on('unhandledRejection', (error) => {
   console.log(`unhandledRejection`, error)
})

process.on('uncaughtExceptionMonitor', (error) => {
   console.log('uncaughtExceptionMonitor', error)
})

process.on('customError', (error) => {
   console.log('customError', error)
})
