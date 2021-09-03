/* eslint-disable semi */
import mongoose from 'mongoose';
// const dg = require('debug')('mongo:connection')
// dg('start connection')
mongoose.connect(
  process.env.DB_URL,
  {},

  (err) => {
    if (err) throw new Error(err.message); // dg('db connected')
  }
);
