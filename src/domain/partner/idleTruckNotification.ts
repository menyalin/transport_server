import { Types } from 'mongoose'
import { IIdleTruckNotifyProps } from './interfaces'

export class IdleTruckNotification {
  _id?: string
  title: string
  agreement?: string
  addresses?: string[]
  emails: string
  ccEmails?: string
  bccEmails?: string
  templateName: string
  idleHoursBeforeNotify: number = 0
  note?: string
  usePlannedDate: boolean
  // useTruckFilter: USE_TRUCK_FILTER_ENUM = USE_TRUCK_FILTER_ENUM.notUsed
  // trucks: string[] = []
  isActive: boolean

  constructor(p: IIdleTruckNotifyProps) {
    if (p._id) this._id = p._id?.toString()
    this.title = p.title
    this.addresses = p.addresses
    this.agreement = p.agreement

    this.emails = p.emails
    this.ccEmails = p.ccEmails
    this.bccEmails = p.bccEmails
    this.templateName = p.templateName
    this.note = p.note

    this.idleHoursBeforeNotify =
      p.idleHoursBeforeNotify !== undefined ? p.idleHoursBeforeNotify : 0

    this.usePlannedDate =
      p.usePlannedDate !== undefined ? !!p.usePlannedDate : false

    this.isActive = p.isActive || false
  }

  includeAddress(address: string): boolean {
    return this.addresses?.includes(address) || false
  }

  allowedAgreement(agreementId: string): boolean {
    return !this.agreement || this.agreement === agreementId
  }

  static dbSchema() {
    return {
      title: { type: String, required: true },
      addresses: [{ type: Types.ObjectId, ref: 'Address' }],
      agreement: { type: Types.ObjectId, ref: 'Agreement' },
      idleHoursBeforeNotify: Number,
      emails: { type: String, required: true },
      ccEmails: String,
      bccEmails: String,
      templateName: String,
      note: String,
      usePlannedDate: { type: Boolean, default: false },
      isActive: Boolean,
    }
  }
}
