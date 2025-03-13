import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  PutBucketCorsCommand,
  GetBucketCorsCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IGenerateObjectPrefix, IGenerateUploadUrlProps } from './interfaces'
import { CompanyRepository, FileRepository } from '@/repositories'
import { isValidObjectId, Types } from 'mongoose'
import { FileRecord, FileRecordStatus } from '@/domain/fileRecord'
import { BadRequestError } from '@/helpers/errors'

class FileService {
  private bucketName: string
  private s3client: S3Client
  private readonly URL_EXPIRATION_SECONDS = 600 //  10 минут
  private hasBucketCORSParams: boolean = false

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME as string
    const s3KeyId = process.env.S3_ACCESS_KEY_ID as string
    const s3Endpoint = (process.env.S3_ENDPOINT as string) ?? 's3.cloud.ru'
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string
    const s3Region = process.env.S3_REGION as string

    if (!this.bucketName) throw new Error('S3_BUCKET_NAME is not defined')
    if (!s3KeyId) throw new Error('S3_ACCESS_KEY_ID is not defined')
    if (!s3SecretAccessKey)
      throw new Error('S3_SECRET_ACCESS_KEY  is not difined')
    if (!s3Region) throw new Error('S3_REGION is not difined')

    this.s3client = new S3Client({
      endpoint: s3Endpoint,
      region: s3Region,
      credentials: {
        accessKeyId: s3KeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    })
    const allowedOrigins = process.env.S3_ALLOWED_ORIGINS?.split(',')
    console.log('origins: ', allowedOrigins)
  }
  private async getBucketCORSParams(): Promise<void> {
    try {
      const command = new GetBucketCorsCommand({
        Bucket: this.bucketName,
      })
      await this.s3client.send(command)
      this.hasBucketCORSParams = true
    } catch (e) {
      console.log('Ошибка получения параметров CORS : ', e)
      this.hasBucketCORSParams = false
    }
  }
  private async setBucketCORSParams() {
    try {
      await this.getBucketCORSParams()
      const allowedOrigins = process.env.S3_ALLOWED_ORIGINS?.split(',')
      const putCorsCommand = new PutBucketCorsCommand({
        Bucket: this.bucketName,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedHeaders: allowedOrigins,
              AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE'],
              AllowedOrigins: ['*'],
            },
          ],
        },
      })
      await this.s3client.send(putCorsCommand)
      console.log('Параметры CORS для S3 установлены')
    } catch (e) {
      console.log('Ошибка установки параметров CORS: ', e)
    }
  }

  async createExcelFile(data: unknown[], wsName = 'data'): Promise<Readable> {
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, worksheet, wsName)
    const excelFile: Buffer = XLSX.write(wb, {
      type: 'buffer',
      bookType: 'xlsx',
    })
    return Readable.from(excelFile)
  }

  async generateObjectPrefix(props: IGenerateObjectPrefix): Promise<string> {
    const { s3Prefix = 'undefined_company' } =
      await CompanyRepository.getCompanySettings(props.companyId)
    return [s3Prefix, props.docType, props.docId, props.fileId].join('/')
  }

  async getFilesInfoByDocId({ docId }: { docId: string }) {
    return await FileRepository.getByDocId(docId)
  }

  async generateUploadUrl(
    props: IGenerateUploadUrlProps
  ): Promise<{ url: string; key: string }> {
    // Добавить создание файла в БД
    const fileId = new Types.ObjectId().toString()
    const key = await this.generateObjectPrefix({
      ...props,
      fileId,
    })
    if (!this.hasBucketCORSParams) await this.setBucketCORSParams()

    const fileRecord = new FileRecord({
      _id: fileId,
      docId: props.docId,
      company: props.companyId,
      key,
      docType: props.docType,
      originalName: props.originalName,
      contentType: props.contentType,
      status: FileRecordStatus.prepared,
      size: props.size,
      note: props.note,
    })

    await FileRepository.create(fileRecord)

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: props.contentType,
    })
    const url = await getSignedUrl(this.s3client, command, {
      expiresIn: this.URL_EXPIRATION_SECONDS,
    })

    return { url, key }
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const fileRecord = await FileRepository.getByKey(key)
    if (!fileRecord) throw new Error('File not found')

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileRecord.key,
      ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileRecord.originalName)}"`,
    })
    return await getSignedUrl(this.s3client, command, {
      expiresIn: this.URL_EXPIRATION_SECONDS,
    })
  }

  async deleteObjectByKey(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })
    const res = await this.s3client.send(command)
    await FileRepository.deleteByKey(key)
  }

  async update(id: string, body: unknown): Promise<FileRecord> {
    if (!id || !isValidObjectId(id)) throw new BadRequestError('Invalid id')

    const res = await FileRepository.updateById(id, body as object)
    if (res) return res
    throw new Error('File not found')
  }
}

export default new FileService()
