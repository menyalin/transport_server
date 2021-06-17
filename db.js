const mongoose = require('mongoose')
const dg = require('debug')('mongo:connection')
dg('start connection')
mongoose.connect(
  process.env.DB_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true
  },
  (err) => {
    if (err) throw new Error(err.message)
    dg('db connected')
  }
)
