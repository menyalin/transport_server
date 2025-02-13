import express, { Request, Response } from 'express'
import { jwtAuth } from '@/utils/auth.middleware'

const router = express.Router()

// api/files

router.post('/', [jwtAuth], (req: Request, res: Response) =>
  ctrl.create(...args)
)

export default router
