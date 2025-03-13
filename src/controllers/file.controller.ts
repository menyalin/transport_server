import { AuthorizedRequest } from './interfaces'
import { Response } from 'express'
import { FileService } from '@/services'
import { BadRequestError } from '@/helpers/errors'
import { FileRecord } from '@/domain/fileRecord'

class FileController {
  async getFilesForDocument(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId)
        new BadRequestError('getFilesForDocument : companyId is missing')

      const fileInfo: FileRecord[] = await FileService.getFilesInfoByDocId({
        docId: req.params.docId,
      })
      res.status(200).json(fileInfo)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async generateUploadUrl(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.companyId)
        new BadRequestError('generateUploadUrl : companyId is missing')
      const data = await FileService.generateUploadUrl({
        ...req.body,
        companyId: req.companyId,
      })
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async deleteObject(req: AuthorizedRequest, res: Response) {
    try {
      const { key } = req.query
      if (!key)
        throw new BadRequestError('deleteObject : object key is missing')
      await FileService.deleteObjectByKey(key as string)
      res.status(200).json('ok')
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
  async update(req: AuthorizedRequest, res: Response) {
    try {
      if (!req.params.fileId) throw new BadRequestError('fileId is missing')
      const data = await FileService.update(req.params.fileId, req.body)
      res.status(200).json(data)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }

  async getDownloadUrl(req: AuthorizedRequest, res: Response) {
    try {
      const { key } = req.query
      if (!key)
        throw new BadRequestError('getDownloadUrl : object key is missing')
      const url = await FileService.generateDownloadUrl(key as string)
      res.status(200).json(url)
    } catch (e) {
      if (e instanceof BadRequestError) res.status(e.statusCode).json(e.message)
      else res.status(500).json(e)
    }
  }
}

export default new FileController()
