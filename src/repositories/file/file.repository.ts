import { FileRecord, FileRecordStatus } from '@/domain/fileRecord'
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

  async getByKey(key: string): Promise<FileRecord | null> {
    const data = await FileRecordModel.findOne({ key }).lean()
    return data ? new FileRecord(data) : null
  }

  async create(fileRecord: FileRecord): Promise<void> {
    await FileRecordModel.create(fileRecord)
  }

  async updateStatusByKey(
    key: string,
    status: FileRecordStatus
  ): Promise<void> {
    await FileRecordModel.findOneAndUpdate({ key }, { status })
  }

  async deleteByKey(key: string): Promise<void> {
    await FileRecordModel.deleteOne({ key })
  }
}
export default new FileRepository()
