import { z } from 'zod'
import { DateRange } from '@/classes/dateRange'

export class GetListPropsDTO {
  period: DateRange
  company: string
  limit: number = 100
  skip: number = 0
  sortBy: string[]
  sortDesc: boolean[]
  agreements?: string[]
  statuses?: string[]
  carriers?: string[]
  number?: string

  constructor(p: any) {
    const validatedProps = GetListPropsDTO.validationSchema.parse(p)
    this.company = validatedProps.company
    this.period = new DateRange(
      validatedProps.period[0],
      validatedProps.period[1]
    )
    this.limit = +validatedProps.limit
    this.skip = +validatedProps.skip
    if (isNaN(this.limit)) this.limit = 100
    if (isNaN(this.skip)) this.skip = 0
    this.sortBy = validatedProps?.sortBy || []
    this.sortDesc = validatedProps?.sortDesc?.map((i) => i === 'true') || []
    this.agreements = validatedProps?.agreements
    this.statuses = validatedProps.statuses
    this.number = validatedProps.number
    this.carriers = validatedProps.carriers
  }

  static validationSchema = z.object({
    period: z.array(z.string().datetime()).length(2),
    company: z.string(),
    limit: z.string(),
    skip: z.string(),
    number: z.string().optional(),
    sortBy: z.array(z.string()).optional().default([]),
    sortDesc: z.array(z.string()).optional().default([]),
    agreements: z.array(z.string()).optional().default([]),
    statuses: z.array(z.string()).optional().default([]),
    carriers: z.array(z.string()).optional().default([]),
  })
}
