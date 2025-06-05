import { Types } from 'mongoose'
import { ILoadingDockProps } from './interfaces'

export class LoadingDock {
  _id?: string
  title: string
  address: string
  allowedLoadingPoints?: string[]
  contacts?: string
  note?: string
  resctrictAddresses: boolean = true

  constructor(p: ILoadingDockProps) {
    if (!p.address || !p.title)
      throw new Error('LoadingDock : constructor : required args is missing')
    if (p._id) this._id = p._id.toString()
    this.title = p.title
    this.address = p.address
    this.allowedLoadingPoints = p.allowedLoadingPoints
    this.contacts = p.contacts
    this.note = p.note
    this.resctrictAddresses = p.resctrictAddresses ?? true
  }

  static dbSchema() {
    return {
      title: String,
      address: { type: Types.ObjectId, ref: 'Address' },
      allowedLoadingPoints: [{ type: Types.ObjectId, ref: 'Address' }],
      contacts: String,
      note: String,
      resctrictAddresses: Boolean,
    }
  }
}
