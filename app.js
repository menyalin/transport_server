import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import errorMiddleware from './utils/error.middleware.js'

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
import tariffRouter from './api/tariff/index.js'
import salaryTariffRouter from './api/salaryTariff/index.js'
import documentRouter from './api/document/index.js'
import zoneRouter from './api/zone/index.js'
import regionRouter from './api/region/index.js'
import cityRouter from './api/city/index.js'
import workerRouter from './api/worker/index.js'
import docsRegistryRouter from './api/docsRegistry/index.js'
import fineRouter from './api/fine/index.js'

import adminRouter from './api/admin/index.js'

const app = express()

app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:8080',
      'https://s4log.ru',
      'https://alfa.s4log.ru',
    ],
  })
)
if (process.env.MODE === 'dev') app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static('static'))

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
app.use('/api/tariffs', tariffRouter)
app.use('/api/salary_tariffs', salaryTariffRouter)
app.use('/api/documents', documentRouter)
app.use('/api/zones', zoneRouter)
app.use('/api/regions', regionRouter)
app.use('/api/cities', cityRouter)
app.use('/api/workers', workerRouter)
app.use('/api/fines', fineRouter)
app.use('/api/docs_registry', docsRegistryRouter)

app.use('/api/admin', adminRouter)
app.use(errorMiddleware)
export default app
