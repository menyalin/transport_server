import express from 'express'
import logger from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { errorMiddleware } from './utils/error.middleware'

import authRouter from './api/auth'
import companiesRouter from './api/company'
import taskRouter from './api/task'
import addressRouter from './api/address'
import driverRouter from './api/driver'
import truckRouter from './api/truck'
import crewRouter from './api/crew'
import carrierRouter from './api/carrier'
import orderRouter from './api/order'
import partnerRouter from './api/partner'
import downtimeRouter from './api/downtime'
import reportRouter from './api/reports'
import orderTemplateRouter from './api/orderTemplate'
import scheduleNoteRouter from './api/scheduleNote'
import agreementRouter from './api/agreement'
import carrierAgreementRouter from './api/carrierAgreement'
import tariffContractRouter from './api/tariffContract'
import salaryTariffRouter from './api/salaryTariff'
import zoneRouter from './api/zone'
import regionRouter from './api/region'
import cityRouter from './api/city'
import workerRouter from './api/worker'
import docsRegistryRouter from './api/docsRegistry'
import fineRouter from './api/fine'
import fileRouter from './api/file'
import paymentInvoiceRouter from './api/paymentInvoice'
import docTemplateRouter from './api/docTemplate'
import adminRouter from './api/admin'
import utilsRouter from './api/utils/utils'
import incomingInvoiceRouter from '@/api/incomingInvoice/incomingInvoice.router'

const app = express()

app.set('query parser', 'extended')
app.set('x-powered-by', false)

app.use(
  cors({
    credentials: true,
    origin: [
      'http://localhost:8080',
      'https://s4log.ru',
      'https://alfa.s4log.ru',
      'https://carrier.logicore.ru',
      'https://logicore.ru',
    ],
  })
)
if (process.env.MODE === 'dev') app.use(logger('dev'))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use('/static', express.static('static'))
app.use('/templates', express.static('templates'))

app.use('/api/auth', authRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/tasks', taskRouter)
app.use('/api/addresses', addressRouter)
app.use('/api/drivers', driverRouter)
app.use('/api/trucks', truckRouter)
app.use('/api/crews', crewRouter)
app.use('/api/carriers', carrierRouter)
app.use('/api/orders', orderRouter)
app.use('/api/partners', partnerRouter)
app.use('/api/downtimes', downtimeRouter)
app.use('/api/reports', reportRouter)
app.use('/api/order_templates', orderTemplateRouter)
app.use('/api/schedule_notes', scheduleNoteRouter)
app.use('/api/agreements', agreementRouter)
app.use('/api/tariff_contracts', tariffContractRouter)
app.use('/api/salary_tariffs', salaryTariffRouter)
app.use('/api/zones', zoneRouter)
app.use('/api/regions', regionRouter)
app.use('/api/cities', cityRouter)
app.use('/api/workers', workerRouter)
app.use('/api/fines', fineRouter)
app.use('/api/files', fileRouter)
app.use('/api/docs_registry', docsRegistryRouter)
app.use('/api/payment_invoice', paymentInvoiceRouter)
app.use('/api/incoming_invoice', incomingInvoiceRouter)
app.use('/api/doc_templates', docTemplateRouter)
app.use('/api/utils', utilsRouter)
app.use('/api/carrier_agreements', carrierAgreementRouter)

app.use('/api/admin', adminRouter)
app.use(errorMiddleware)

export default app
