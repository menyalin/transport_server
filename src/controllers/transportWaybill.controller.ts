import { Response } from 'express'
import { Readable } from 'stream'
import { TransportWaybillService } from '@/services'
import { AuthorizedRequest } from './interfaces'
import { BadRequestError } from '@/helpers/errors'

class TransportWaybillController {
  async create(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.create({
        body: { ...req.body, company: req.companyId },
        user: req.userId,
      })
      res.status(201).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getById(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.getById(req.params.id)
      res.status(200).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async getByOrderId(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.getByOrderId(
        req.params.orderId
      )
      res.status(200).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async updateOne(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.updateOne({
        id: req.params.id,
        body: { ...req.body, company: req.companyId },
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async deleteById(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.deleteById({
        id: req.params.id,
        user: req.userId,
      })
      res.status(200).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }

  async downloadDocs(
    req: AuthorizedRequest<{ id: string }, any, { templateName: string }>,
    res: Response
  ) {
    try {
      const { filename, buffer } = await TransportWaybillService.downloadDoc(
        req.params.id,
        req.body.templateName
      )

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(filename)}"`
      )
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
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
      const data = await TransportWaybillService.getList(req.query)
      res.status(200).json(data)
    } catch (e: any) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new TransportWaybillController()
