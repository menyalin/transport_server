import z from 'zod'
import { Readable } from 'stream'
import * as XLSX from 'xlsx'
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { IGenerateObjectPrefix } from './interfaces'
import { CompanyService } from '..'
import { CompanyRepository } from '@/repositories'

class FileService {
  private bucketName: string
  private s3client: S3Client
  private readonly URL_EXPIRATION_SECONDS = 300 //  5 минут

  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME as string
    const s3KeyId = process.env.S3_ACCESS_KEY_ID as string
    const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY as string
    const s3Region = process.env.S3_REGION as string

    if (!this.bucketName) throw new Error('S3_BUCKET_NAME is not defined')
    if (!s3KeyId) throw new Error('S3_ACCESS_KEY_ID is not defined')
    if (!s3SecretAccessKey)
      throw new Error('S3_SECRET_ACCESS_KEY  is not difined')
    if (!s3Region) throw new Error('S3_REGION is not difined')

    this.s3client = new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: s3KeyId,
        secretAccessKey: s3SecretAccessKey,
      },
    })
  }

  async generateObjectPrefix(props: IGenerateObjectPrefix): Promise<string> {
    const { s3Prefix = 'undefined_company' } =
      await CompanyRepository.getCompanySettings(props.companyId)

    return [s3Prefix, props.docType, props.docId, props.fileId].join('/')
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

  async generateUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    })
    return await getSignedUrl(this.s3client, command, {
      expiresIn: this.URL_EXPIRATION_SECONDS,
    })
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    })
    return await getSignedUrl(this.s3client, command, {
      expiresIn: this.URL_EXPIRATION_SECONDS,
    })
  }
}

export default new FileService()
