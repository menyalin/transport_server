import { Response } from 'express'
import { Readable } from 'stream'
import { AuthorizedRequest } from './interfaces/request'
import {
  FileService,
  PaymentInvoiceService,
  PermissionService,
} from '../services'
import { BadRequestError } from '../helpers/errors'
import { DateRange } from '../classes/dateRange'
import { OrderPickedForInvoiceDTO } from '../domain/paymentInvoice/dto/orderPickedForInvoice.dto'

class PaymentInvoiceController {
  service: typeof PaymentInvoiceService
  permissionName: string

  constructor({
    service,
    permissionName,
  }: {
    service: typeof PaymentInvoiceService
    permissionName: string
  }) {
    this.service = service
    this.permissionName = permissionName
  }

  async deleteById(req: AuthorizedRequest, res: Response) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':delete',
        })
      const data = await this.service.deleteById({
        id: req.params.id,
        user: req.userId,
        company: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async create(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const data = await this.service.create({
        body: req.body,
        user: req.userId,
        company: req.companyId,
      })
      res.status(201).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updateOne(req: AuthorizedRequest, res: Response) {
    try {
      if (this.permissionName)
        await PermissionService.check({
          userId: req.userId,
          companyId: req.companyId,
          operation: this.permissionName + ':write',
        })
      const data = await this.service.updateOne({
        id: req.params.id,
        body: req.body,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getById(req: AuthorizedRequest, res: Response) {
    try {
      const data = await this.service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async downloadDocs(
    req: AuthorizedRequest<{ id: string }, any, { templateName: string }>,
    res: Response
  ) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':write',
      })

      const buffer = await this.service.downloadDoc(
        req.params.id,
        req.body.templateName
      )
      const stream = Readable.from(buffer)
      res.status(201)
      stream.pipe(res)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getList(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })
      const data = await this.service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getInvoicesListFile(req: AuthorizedRequest, res: Response) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: this.permissionName + ':readList',
      })
      const data = await this.service.getList({
        ...req.query,
        skip: '0',
        limit: '0',
      })

      const stream = await FileService.createExcelFile(
        data.items.map((i: any) => ({
          _id: i._id.toString(),
          ['Номер']: i.number,
          ['Номер клиента']: i.numberByClient,
          ['Дата выставления']: i.sendDate,
          ['Дата реестра']: i.dateByClient,
          ['Статус']: i.statusStr,
          ['Клиент']: i.clientName,
          ['Соглашение']: i.agreementName,
          ['Рейсы']: i.count,
          ['Сумма без НДС']: i.total.priceWOVat,
          ['Сумма с НДС']: i.total.price,
          ['Дата создания']: i.createdAt,
          ['Комментарий']: i.note,
        }))
      )
      res.status(200)
      stream.pipe(res)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getAllowedPrintForms(
    req: AuthorizedRequest<
      any,
      any,
      any,
      { agreement: string; client: string }
    >,
    res: Response
  ) {
    try {
      const data = await this.service.getAllowedPrintForms(
        req.query.agreement,
        req.query.client
      )
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async pickOrders(
    req: AuthorizedRequest<
      unknown,
      unknown,
      unknown,
      {
        company: string
        client: string
        agreement: string
        period: string[]
        paymentInvoiceId?: string
        docStatus?: string
        onlySelectable?: boolean
        truck?: string
        driver?: string
        loadingZone?: string
        search?: string
        numbers?: string[]
      }
    >,
    res: Response
  ) {
    try {
      const data = await this.service.pickOrders({
        ...req.query,
        company: req.companyId,
        period: new DateRange(req.query.period[0], req.query.period[1]),
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async addOrdersToInvoice(req: AuthorizedRequest, res: Response) {
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
        registryData: req.body.registryData,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async updateOrderPrices(
    req: AuthorizedRequest<{ orderId: string }>,
    res: Response
  ) {
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
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async removeOrdersFromPaymentInvoice(req: AuthorizedRequest, res: Response) {
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
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new PaymentInvoiceController({
  service: PaymentInvoiceService,
  permissionName: 'paymentInvoice',
})
