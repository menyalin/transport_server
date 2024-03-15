import { z } from 'zod'
import { Types } from 'mongoose'
import { printFormTypeValues, printFormTypes } from './enums'

export class PrintForm {
  name: string
  templateName: string
  filenamePattern: string
  docType: string
  pfType: printFormTypes
  agreement: string | null
  client?: string
  data: any

  constructor(p: any) {
    const validProps = PrintForm.schema.parse(p)
    this.name = validProps.name
    this.templateName = validProps.templateName
    this.filenamePattern = validProps.filenamePattern
    this.docType = validProps.docType
    this.pfType = validProps.pfType
    this.agreement = validProps.agreement || null
    this.data = validProps.data
  }

  static schema = z.object({
    name: z.string(),
    filenamePattern: z.string(),
    docType: z.string(),
    templateName: z.string(),
    pfType: z.nativeEnum(printFormTypes),
    agreement: z.string().nullable(),
    data: z.any(),
    client: z.string().nullable(),
  })

  static dbSchema = {
    name: { type: String, required: true },
    filenamePattern: { type: String, required: true },
    templateName: { type: String, required: true, unique: true },
    docType: { type: String },
    client: { type: Types.ObjectId, ref: 'Partner' },
    pfType: { type: String, enum: printFormTypeValues },
    agreement: { type: Types.ObjectId, ref: 'Agreement' },
    data: Object,
  }
}
