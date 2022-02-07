import express from 'express'
import logger from 'morgan'
import cors from 'cors'

import authRouter from './api/auth/index.js'
import companiesRouter from './api/company/index.js'
import taskRouter from './api/task/index.js'
import addressRouter from './api/address/index.js'
import driverRouter from './api/driver/index.js'
import truckRouter from './api/truck/index.js'
import crewRouter from './api/crew/index.js'
import tkNameRouter from './api/tkName/index.js'
import orderRouter from './api/order/index.js'
import partnerRouter from './api/partner/index.js'
import downtimeRouter from './api/downtime/index.js'
import reportRouter from './api/reports/index.js'
import orderTemplateRouter from './api/orderTemplate/index.js'
import scheduleNoteRouter from './api/scheduleNote/index.js'
import agreementRouter from './api/agreement/index.js'

const app = express()

app.use(cors(['*']))
if (process.env.MODE === 'dev') app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api/auth', authRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/addresses', addressRouter)
app.use('/api/drivers', driverRouter)
app.use('/api/trucks', truckRouter)
app.use('/api/crews', crewRouter)
app.use('/api/tk_names', tkNameRouter)
app.use('/api/orders', orderRouter)
app.use('/api/partners', partnerRouter)
app.use('/api/downtimes', downtimeRouter)
app.use('/api/reports', reportRouter)
app.use('/api/order_templates', orderTemplateRouter)
app.use('/api/schedule_notes', scheduleNoteRouter)
app.use('/api/agreements', agreementRouter)

export default app
