import { Schema, model } from 'mongoose'
import { PrintForm } from '../../../domain/printForm/printForm.domain'

const schema = new Schema(PrintForm.dbSchema, {
  timestamps: true,
})

export const PrintFormModel = model<PrintForm>(
  'PrintForm',
  schema,
  'printForms'
)
