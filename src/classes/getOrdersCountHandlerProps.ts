import { DateRange } from './dateRange'

export class GetDocsCountProps {
  period: DateRange
  company: string
  status: string = 'completed'
  isActive: boolean = true
  key?: string

  constructor(p: any) {
    this.period = new DateRange(p.period[0], p.period[1])
    this.company = p.company
    if (p.status) this.status = p.status
    if (p.isActive !== undefined) this.isActive = p.isActive
    this.key = p.key
  }
}
