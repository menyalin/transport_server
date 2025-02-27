import { objectIdSchema } from '@/shared/validationSchemes'
import { Types } from 'mongoose'
import z from 'zod'

export enum FileRecordStatus {
  prepared = 'prepared',
  pending = 'pending',
  uploaded = 'uploaded',
  failed = 'failed',
  deleted = 'deleted',
}

export class FileRecord {
  _id: string
  docId: string
  key: string // Ключ (имя) файла в S3
  originalName: string // Исходное имя файла
  contentType: string
  size?: number
  note?: string | null
  uploadDate: Date
  status: FileRecordStatus

  constructor(props: unknown) {
    const p = FileRecord.validationSchema.parse(props)
    this._id = p._id
    this.docId = p.docId
    this.key = p.key
    this.originalName = p.originalName
    this.contentType = p.contentType
    this.size = p.size
    this.note = p.note
    this.uploadDate = p.uploadDate ?? new Date()
    this.status = p.status
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema.transform((v) => v?.toString()),
      docId: objectIdSchema.transform((v) => v.toString()),
      key: z.string(),
      note: z.string().optional().nullable(),
      originalName: z.string(),
      contentType: z.string(),
      size: z.number().optional(),
      uploadDate: z
        .union([z.date(), z.string()])
        .optional()
        .nullable()
        .transform((v) => (v ? new Date(v) : undefined)),
      status: z.nativeEnum(FileRecordStatus).default(FileRecordStatus.prepared),
    })
  }

  static get dbSchema() {
    return {
      key: { type: String, required: true, unique: true },
      docId: { type: Types.ObjectId, required: true },
      originalName: { type: String, required: true },
      note: String,
      contentType: { type: String, required: true },
      size: Number,
      status: String,
      uploadDate: { type: Date },
    }
  }
}
