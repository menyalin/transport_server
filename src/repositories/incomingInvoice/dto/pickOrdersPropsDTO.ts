import { z } from 'zod'
import { DateRange } from '@/classes/dateRange'
import { ORDER_DOC_STATUSES_ENUM } from '@/constants/orderDocsStatus'

export class PickOrdersPropsDTO {
  company: string
  agreement: string
  carrier: string
  period: DateRange
  docStatuses?: ORDER_DOC_STATUSES_ENUM[]
  number?: string
  limit: number = 200
  skip: number = 0

  constructor(p: any) {
    const validatedProps = PickOrdersPropsDTO.validationSchema.parse(p)
    this.agreement = validatedProps.agreement
    this.carrier = validatedProps.carrier
    this.company = validatedProps.company
    this.number = validatedProps.number
    this.period = new DateRange(
      validatedProps.period[0],
      validatedProps.period[1]
    )
    this.limit = +validatedProps.limit
    this.skip = +validatedProps.skip
    this.docStatuses = validatedProps?.docStatuses
    if (isNaN(this.limit)) this.limit = 100
    if (isNaN(this.skip)) this.skip = 0
  }
  static get validationSchema() {
    return z.object({
      company: z.string(),
      docStatuses: z
        .array(z.nativeEnum(ORDER_DOC_STATUSES_ENUM))
        .optional()
        .default([]),
      agreement: z.string(),
      carrier: z.string(),
      number: z.string().optional(),
      period: z.array(z.string()).length(2),
      limit: z.string(),
      skip: z.string(),
    })
  }
}
