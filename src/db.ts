import mongoose from 'mongoose'

mongoose.set('strictQuery', false)
mongoose.connect(process.env.DB_URL as string)

mongoose.connection.on('error', (err) => {
  console.log('db_connection_error:')
  console.log(err)
  process.exit()
})

mongoose.connection.on('connected', () => {
  console.log('db_connected')
})
