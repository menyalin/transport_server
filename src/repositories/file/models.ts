import { FileRecord } from '@/domain/fileRecord'
import { model, Schema } from 'mongoose'

const fileRecordSchema = new Schema(FileRecord.dbSchema, {
  timestamps: true,
})

export const FileRecordModel = model<FileRecord>(
  'FileRecord',
  fileRecordSchema,
  'files'
)
