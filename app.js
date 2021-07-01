import express from 'express'
import logger from 'morgan'
import cors from 'cors'

import authRouter from './api/auth/index.js'
import companiesRouter from './api/company/index.js'
import taskRouter from './api/task/index.js'
import addressRouter from './api/address/index.js'

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/addresses', addressRouter)

export default app
