// @ts-nocheck
import express from 'express'
import { jwtAuth } from '../../utils/auth.middleware'
import { bodyValidator, queryValidator } from '../../utils/validator'

import {
  getListSchema,
  addOrdersToInvoiceSchema,
  downloadDocsSchema,
  getAllowedPFSchema,
} from './schemes'
import ctrl from '../../controllers/paymentInvoice.controller'

const router = express.Router()

// api/payment_invoice
router.get('/', [jwtAuth, queryValidator(getListSchema)], (...args) =>
  ctrl.getList(...args)
)
router.get(
  '/download_list',
  [jwtAuth, queryValidator(getListSchema)],
  (...args) => ctrl.getInvoicesListFile(...args)
)

router.get('/pick_orders', [jwtAuth], (...args) => ctrl.pickOrders(...args))
router.get(
  '/allowed_print_forms',
  [jwtAuth, queryValidator(getAllowedPFSchema)],
  (...args) => ctrl.getAllowedPrintForms(...args)
)
router.get('/:id', [jwtAuth], (...args) => ctrl.getById(...args))

router.post(
  '/add_orders_to_invoice',
  [jwtAuth, bodyValidator(addOrdersToInvoiceSchema)],
  (...args) => ctrl.addOrdersToInvoice(...args)
)

router.post(
  '/:id/download_docs',
  [jwtAuth, bodyValidator(downloadDocsSchema)],
  (...args) => ctrl.downloadDocs(...args)
)

router.post(
  '/remove_orders_from_invoice',
  [jwtAuth, bodyValidator(addOrdersToInvoiceSchema)],

  (...args) => ctrl.removeOrdersFromPaymentInvoice(...args)
)

router.post('/', [jwtAuth], (...args) => ctrl.create(...args))
router.put('/:id', [jwtAuth], (...args) => ctrl.updateOne(...args))
router.put('/update_prices/:orderId', [jwtAuth], (...args) =>
  ctrl.updateOrderPrices(...args)
)

// update_prices/
router.delete('/:id', [jwtAuth], (...args) => ctrl.deleteById(...args))

export default router
