import { FileRecord } from '@/domain/fileRecord'
import { FileRecordModel } from './models'
import { isValidObjectId } from 'mongoose'
import { BadRequestError } from '@/helpers/errors'

class FileRepository {
  async getByDocId(docId: string): Promise<FileRecord[]> {
    if (!isValidObjectId(docId))
      throw new BadRequestError('FileRepository : getByDocId : invalid docId')
    const data = await FileRecordModel.find({ docId })
    return data.map((i) => new FileRecord(i))
  }

  async create(fileRecord: FileRecord): Promise<void> {
    await FileRecordModel.create(fileRecord)
  }
}
export default new FileRepository()
