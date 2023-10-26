import { Types } from 'mongoose'
import { IIdleTruckNotifyProps, USE_TRUCK_FILTER_ENUM } from './interfaces'

export class IdleTruckNotification {
  _id?: string
  title: string
  companyName: string
  addresses?: string[]
  emails: string
  ccEmails?: string
  templateName: string
  idleHoursBeforeNotify: number = 0
  note?: string
  usePlannedDate: boolean
  useTruckFilter: USE_TRUCK_FILTER_ENUM = USE_TRUCK_FILTER_ENUM.notUsed
  trucks: string[] = []
  isActive: boolean

  constructor(p: IIdleTruckNotifyProps) {
    if (p._id) this._id = p._id?.toString()
    this.title = p.title
    this.addresses = p.addresses
    this.companyName = p.companyName
    this.emails = p.emails
    this.ccEmails = p.ccEmails
    this.templateName = p.templateName
    this.note = p.note
    this.idleHoursBeforeNotify =
      p.idleHoursBeforeNotify !== undefined ? p.idleHoursBeforeNotify : 0
    this.usePlannedDate =
      p.usePlannedDate !== undefined ? !!p.usePlannedDate : false
    if (p.useTruckFilter) this.useTruckFilter = p.useTruckFilter
    this.trucks = p.trucks || []
    this.isActive = p.isActive || false
  }

  includeAddress(address: string): boolean {
    return this.addresses?.includes(address) || false
  }

  static dbSchema() {
    return {
      title: { type: String, required: true },
      addresses: [{ type: Types.ObjectId, ref: 'Address' }],
      companyName: { type: String, required: true },
      idleHoursBeforeNotify: Number,
      emails: { type: String, required: true },
      ccEmails: String,
      templateName: String,
      note: String,
      usePlannedDate: { type: Boolean, default: false },
      useTruckFilter: { type: String, enum: USE_TRUCK_FILTER_ENUM },
      trucks: [{ type: Types.ObjectId, ref: 'Truck' }],
      isActive: Boolean,
    }
  }
}
