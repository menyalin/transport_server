import { Response } from 'express'
import { TransportWaybillService } from '@/services'
import { AuthorizedRequest } from './interfaces'

class TransportWaybillController {
  async create(req: AuthorizedRequest, res: Response) {
    try {
      const data = await TransportWaybillService.create({
        body: req.body,
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
        body: req.body,
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
