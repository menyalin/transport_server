// @ts-nocheck
import { IController } from './iController'
import { PaymentInvoiceService, PermissionService } from '../services'

class PaymentInvoiceController extends IController {
  constructor({ service, permissionName }) {
    super({ service, permissionName })
    this.service = service
  }

  // async deleteById(req, res) {
  //   try {
  //     if (this.permissionName)
  //       await PermissionService.check({
  //         userId: req.userId,
  //         companyId: req.companyId,
  //         operation: this.permissionName + ':delete',
  //       })
  //     const data = await this.service.deleteById({
  //       id: req.params.id,
  //       user: req.userId,
  //       company: req.companyId,
  //     })
  //     res.status(200).json(data)
  //   } catch (e) {
  //     res.status(e.statusCode || 500).json(e.message)
  //   }
  // }

  async getList(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async pickOrders(req, res) {
    try {
      const data = await this.service.pickOrders({
        paymentInvoiceId: req.query.paymentInvoiceId,
        company: req.companyId,
        ...req.query,
        period: new DateRange(req.query.period[0], req.query.period[1]),
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async addOrdersToInvoice(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.addOrdersToInvoice({
        paymentInvoiceId: req.body.paymentInvoiceId,
        orders: req.body.orders,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateOrderPrices(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.updateOrderPrices({
        orderId: req.params.orderId,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async removeOrdersFromPaymentInvoice(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.removeOrdersFromPaymentInvoice({
        paymentInvoiceId: req.body.paymentInvoiceId,
        rowIds: req.body.rowIds,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new PaymentInvoiceController({
  service: PaymentInvoiceService,
  permissionName: 'paymentInvoice',
})
