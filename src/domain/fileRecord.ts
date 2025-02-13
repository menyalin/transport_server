import { objectIdSchema } from '@/shared/validationSchemes'
import z from 'zod'

export class FileRecord {
  _id: string
  key: string // Ключ (имя) файла в S3
  originalName: string // Исходное имя файла
  contentType: string
  size?: number
  note?: string | null
  uploadDate: Date

  constructor(props: unknown) {
    const p = FileRecord.validationSchema.parse(props)
    this._id = p._id
    this.key = p.key
    this.originalName = p.originalName
    this.contentType = p.contentType
    this.size = p.size
    this.uploadDate = p.uploadDate
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema.transform((v) => v.toString()),
      key: z.string(),
      note: z.string().optional().nullable(),
      originalName: z.string(),
      contentType: z.string(),
      size: z.number().optional(),
      uploadDate: z.union([z.date(), z.string()]).transform((v) => new Date(v)),
    })
  }
  static get dbSchema() {
    return {
      key: { type: String, required: true, unique: true },
      originalName: { type: String, required: true },
      note: String,
      contentType: { type: String, required: true },
      size: Number,
      uploadDate: { type: Date },
    }
  }
}
