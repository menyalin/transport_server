import express from 'express'
import { jwtAuth } from '../../utils/auth.middleware.js'
import { bodyValidator, queryValidator } from '../../utils/validator.js'

import { getListSchema, addOrdersToInvoiceSchema } from './schemes.js'
import ctrl from '../../controllers/paymentInvoice.controller.js'

const router = express.Router()

// api/payment_invoice
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)
router.get('/pick_orders', [jwtAuth], (...args) => ctrl.pickOrders(...args))
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post(
  '/add_orders_to_invoice',
  [jwtAuth, bodyValidator(addOrdersToInvoiceSchema)],
  (...args) => ctrl.addOrdersToInvoice(...args)
)

router.post(
  '/remove_orders_from_invoice',
  [jwtAuth, bodyValidator(addOrdersToInvoiceSchema)],
  (...args) => ctrl.removeOrdersFromPaymentInvoice(...args)
)

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
