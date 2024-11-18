import { jwtAuth } from '@/utils/auth.middleware'
import express, { Request, Response } from 'express'
import IncomingInvoiceController from '@/controllers/incomingInvouce.controller'
import { AuthorizedRequest } from '@/controllers/interfaces'
const router = express.Router()

// api/incoming_invoices

router.get('/', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.getList(req as AuthorizedRequest, res)
)

router.get('/pick_orders', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.pickOrders(req as AuthorizedRequest, res)
)
router.get('/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.getById(req as AuthorizedRequest, res)
)

router.post('/', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.create(req as AuthorizedRequest, res)
)

router.put('/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.updateOne(req as AuthorizedRequest, res)
)

router.delete('/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.deleteById(req as AuthorizedRequest, res)
)

// api/incoming_invoices/orders
router.get('/orders/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.getInvoiceOrders(req as AuthorizedRequest, res)
)

router.post('/orders/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.addOrdersToInvoice(req as AuthorizedRequest, res)
)
router.put('/orders/:id/:orderId', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.updateOrderInInvoice(req as AuthorizedRequest, res)
)
router.delete('/orders/:id', [jwtAuth], (req: Request, res: Response) =>
  IncomingInvoiceController.deleteOrderFromInvoice(
    req as AuthorizedRequest,
    res
  )
)

export default router
