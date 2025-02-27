import express, { Request, Response } from 'express'
import { jwtAuth } from '@/utils/auth.middleware'
import ctrl from '@/controllers/file.controller'
import { AuthorizedRequest } from '@/controllers/interfaces'

const router = express.Router()

// api/storage

router.get('/:docId', [jwtAuth], (req: Request, res: Response) =>
  ctrl.getFilesForDocument(req as AuthorizedRequest, res)
)
router.put('/generate_upload_url', [jwtAuth], (req: Request, res: Response) =>
  ctrl.generateUploadUrl(req as AuthorizedRequest, res)
)

export default router
