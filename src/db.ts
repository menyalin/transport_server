// @ts-nocheck
/* eslint-disable semi */
import mongoose from 'mongoose'
// dg('start connection')
mongoose.set('strictQuery', false)
mongoose.connect(
  process.env.DB_URL,
  {},

  (err) => {
    if (err) throw new Error(err.message) // dg('db connected')
  }
)
