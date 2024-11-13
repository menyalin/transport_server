import { z } from 'zod'
import { IncomingInvoiceOrder } from '../IncomingInvoiceOrder'
import { objectIdSchema } from '@/shared/validationSchemes'

export class CreateIncomingInvoiceDTO {
  _id: string
  company: string
  number: string
  date: Date
  plannedPayDate: Date | null
  agreement: string
  status: string
  isActive: boolean
  note?: string
  orders?: IncomingInvoiceOrder[]

  constructor(p: CreateIncomingInvoiceDTO) {
    try {
      this._id = p._id.toString()
      this.company = p.company
      this.number = p.number
      this.date = p.date
      this.plannedPayDate = p.plannedPayDate
      this.agreement = p.agreement
      this.status = p.status
      this.isActive = p.isActive
      this.note = p.note
      this.orders = p.orders?.map((i) => new IncomingInvoiceOrder(i)) || []
    } catch (error) {
      console.log(error)
      throw error
    }
  }

  static get validationSchema() {
    return z.object({
      _id: objectIdSchema,
      company: z.string(),
      number: z.string(),
      date: z.date(),
      plannedPayDate: z.date().optional(),
      agreement: z.string(),
      status: z.string(),
      isActive: z.boolean(),
      note: z.string().optional(),
      orders: z.array(IncomingInvoiceOrder.validationSchema).optional(),
    })
  }
}
