// @ts-nocheck
import { AutoSetRouteDatesDTO } from '../dto/autoSetRouteDates.dto'
import { OrderService as service, PermissionService } from '../services'
import { BadRequestError } from '@/helpers/errors'
import { Readable } from 'stream'

class OrderController {
  async create(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: 'order:daysForWrite',
      })

      const data = await service.create({ body: req.body, user: req.userId })
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async createFromTemplate(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: 'order:daysForWrite',
      })
      const data = await service.createFromTemplate({
        body: req.body,
        user: req.userId,
      })
      res.status(201).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async saveFinalPrices(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: 'order:writeFinalPrices',
      })
      const data = await service.updateFinalPrices({
        orderId: req.body.orderId,
        finalPrices: req.body.finalPrices,
        company: req.body.company,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateOne(req, res) {
    try {
      await PermissionService.check({
        userId: req.userId,
        companyId: req.companyId,
        operation: 'order:daysForWrite',
      })
      const data = await service.updateOne({
        id: req.params.id,
        body: req.body,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getList(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      await PermissionService.checkPeriod({
        userId: req.userId,
        companyId: req.companyId,
        startDate: req.query.startDate,
        operation: 'order:daysForRead',
      })
      const data = await service.getList(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getListForSchedule(req, res) {
    try {
      if (!req.query.profile)
        res.status(400).json({ message: 'bad query params' })
      const data = await service.getListForSchedule(req.query)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getById(req, res) {
    try {
      const data = await service.getById(req.params.id)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async deleteById(req, res) {
    try {
      await PermissionService.check({
        operation: 'order:delete',
        userId: req.userId,
        companyId: req.companyId,
      })
      const data = await service.deleteById({
        id: req.params.id,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getDistance(req, res) {
    try {
      const data = await service.getDistance(req.body)
      res.status(200).json(data)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getAllowedPrintForms(req, res) {
    try {
      const data = await service.getAllowedPrintForms(req.query)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async downloadDoc(req, res) {
    try {
      const buffer = await service.downloadDoc({
        orderId: req.params.id,
        templateName: req.body.templateName,
      })
      const stream = Readable.from(buffer)
      res.status(201)
      stream.pipe(res)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async setDocsState(req, res) {
    try {
      await PermissionService.check({
        operation: 'order:setDocs',
        userId: req.userId,
        companyId: req.companyId,
      })
      const updatedOrder = await service.setDocsState(
        req.params.id,
        req.body.state
      )
      res.status(200).json(updatedOrder)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async setDocs(req, res) {
    try {
      await PermissionService.check({
        operation: 'order:setDocs',
        userId: req.userId,
        companyId: req.companyId,
      })
      const updatedOrder = await service.setDocs(req.params.id, req.body.docs)
      res.status(200).json(updatedOrder)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async autoSetRouteDates(req, res) {
    try {
      await PermissionService.check({
        operation: 'order:autoFillRouteDates',
        userId: req.userId,
        companyId: req.companyId,
      })
      const result = await service.autoSetRoutesDates(
        new AutoSetRouteDatesDTO(req.body),
        req.companyId
      )
      res.status(200).json(result)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new OrderController()
