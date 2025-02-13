import { Response } from 'express'
import { FileService } from '@/services'
import { AuthorizedRequest } from './interfaces'
import { BadRequestError } from '@/helpers/errors'
import { z } from 'zod'

class FileController {
  async generateUploadLink(req: AuthorizedRequest, res: Response) {
    try {
      const bodySchema = z.object({
        docId: z.string(),
        docType: z.string(),
        companyId: z.string(),
        originalName: z.string(),
        contentType: z.string(),
        size: z.number(),
      })

      const parsedPayload = bodySchema.parse(req.body)
      const file = await FileRepository.create(parsedPayload)
      const prefix = await FileService.generateObjectPrefix(parsedPayload)
      const 
      
      const data = await FileService.generateUploadUrl()
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new FileController()
