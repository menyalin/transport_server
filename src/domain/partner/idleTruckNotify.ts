export interface IIdleTruckNotifyProps {
  _id?: string
  title: string
  addresses?: string[]
  emails: string
  ccEmails?: string
  idleHoursBeforeNotify?: number
  templateName: string
}

export class IdleTruckNotify {
  _id?: string
  title: string
  addresses?: string[]
  emails: string
  ccEmails?: string
  templateName: string
  idleHoursBeforeNotify: number = 0

  constructor(p: IIdleTruckNotifyProps) {
    if (p._id) this._id = p._id.toString()
    this.title = p.title
    this.addresses = p.addresses
    this.emails = p.emails
    this.ccEmails = p.ccEmails
    this.templateName = p.templateName
    this.idleHoursBeforeNotify =
      p.idleHoursBeforeNotify !== undefined ? p.idleHoursBeforeNotify : 0
  }

  static dbSchema() {
    return {
      title: String,
      addresses: [],
      idleHoursBeforeNotify: Number,
      emails: String,
      ccEmails: String,
      templateName: String,
    }
  }
}
