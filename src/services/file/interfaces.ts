export interface IGenerateObjectPrefix {
  companyId: string
  docType: string
  docId: string
  fileId: string
}

export interface IGenerateUploadUrlProps {
  companyId: string
  docType: string
  docId: string
  originalName: string
  contentType: string
  size: number
  note?: string
}
