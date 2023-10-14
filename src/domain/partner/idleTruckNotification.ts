import { IIdleTruckNotifyProps } from './interfaces'

export class IdleTruckNotification {
  _id?: string
  title: string
  addresses?: string[]
  emails: string
  ccEmails?: string
  templateName: string
  idleHoursBeforeNotify: number = 0
  note?: string
  usePlannedDate: boolean

  constructor(p: IIdleTruckNotifyProps) {
    if (p._id) this._id = p._id?.toString()
    this.title = p.title
    this.addresses = p.addresses
    this.emails = p.emails
    this.ccEmails = p.ccEmails
    this.templateName = p.templateName
    this.note = p.note
    this.idleHoursBeforeNotify =
      p.idleHoursBeforeNotify !== undefined ? p.idleHoursBeforeNotify : 0
    this.usePlannedDate =
      p.usePlannedDate !== undefined ? !!p.usePlannedDate : false
  }

  includeAddress(address: string): boolean {
    return this.addresses?.includes(address) || false
  }

  static dbSchema() {
    return {
      title: String,
      addresses: [],
      idleHoursBeforeNotify: Number,
      emails: String,
      ccEmails: String,
      templateName: String,
      note: String,
      usePlannedDate: { type: Boolean, default: false },
    }
  }
}
