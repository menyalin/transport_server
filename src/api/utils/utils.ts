import express, { Request, Response } from 'express'
import { jwtAuth } from '@/utils/auth.middleware'
import multer from 'multer'
import XLSX from 'xlsx'
const upload = multer({ storage: multer.memoryStorage() })

const router = express.Router()

router.post(
  '/xlsx_to_json',
  [jwtAuth, upload.single('file')],
  (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).send('No file uploaded.')
      return
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' })
    const sheet_name_list = workbook.SheetNames
    const jsonData = XLSX.utils.sheet_to_json(
      workbook.Sheets[sheet_name_list[0]]
    )

    res.json(jsonData)
  }
)

export default router
