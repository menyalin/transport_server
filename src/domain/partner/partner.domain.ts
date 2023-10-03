import { Types } from 'mongoose'
import {
  PARTNER_GROUPS_ENUM_VALUES,
  PARTNER_GROUPS_ENUM,
} from '../../constants/partner'
import { LoadingDock } from './loadingDock.domain'
import { IdleTruckNotify } from './idleTruckNotify'
import { BusEvent } from 'ts-bus/types'

import { PARTNER_DOMAIN_EVENTS, UpdatePartnerEvent } from './domainEvents'
import { NotifyClientsEvent } from '../../socket/notifyClientsEvent'

const setLoadingDocs = (
  loadingDocks: Array<LoadingDock> | undefined
): Array<LoadingDock> => {
  if (!loadingDocks || !Array.isArray(loadingDocks)) return []
  if (loadingDocks.every((i) => i instanceof LoadingDock)) return loadingDocks
  return loadingDocks.map((i) => new LoadingDock(i))
}

const setIdleTruckNotifications = (
  notifications: IdleTruckNotify[] | undefined
): IdleTruckNotify[] => {
  if (!notifications || !Array.isArray(notifications)) return []
  if (notifications.every((i) => i instanceof IdleTruckNotify))
    return notifications

  return notifications.map((i) => new IdleTruckNotify(i))
}

export interface IParterProps {
  name: string
  fullName: string
  inn?: string
  company: string
  contacts?: string
  group?: PARTNER_GROUPS_ENUM
  isClient?: boolean
  isService?: boolean
  isActive?: boolean
  placesForTransferDocs?: LoadingDock[]
  idleTruckNotifications?: IdleTruckNotify[]
}
export interface IPartnerWithIdProps extends IParterProps {
  _id: string | Types.ObjectId
}

export class Partner {
  events: BusEvent<any>[] = []

  _id?: string
  name: string
  fullName: string
  inn?: string
  company: string | Types.ObjectId
  contacts?: string
  group?: PARTNER_GROUPS_ENUM
  isClient?: boolean = false
  isService?: boolean = false
  isActive: boolean = true
  placesForTransferDocs: LoadingDock[] = []
  idleTruckNotifications: IdleTruckNotify[] = []

  constructor(p: IPartnerWithIdProps | IParterProps) {
    if ('_id' in p) this._id = p._id.toString()
    this.company = p.company
    this.name = p.name
    this.fullName = p.fullName
    this.inn = p.inn
    this.contacts = p.contacts
    this.group = p.group
    this.isClient = p.isClient
    this.isActive = p.isActive !== undefined ? p.isActive : true
    this.placesForTransferDocs = setLoadingDocs(p.placesForTransferDocs)
    this.idleTruckNotifications = setIdleTruckNotifications(
      p.idleTruckNotifications
    )
  }

  get id() {
    return this._id?.toString() || null
  }

  clearEvents() {
    this.events = []
  }

  toObject(): object {
    const obj: { [key: string]: any } = {}
    Object.getOwnPropertyNames(this).forEach((prop: string) => {
      obj[prop] = (this as any)[prop]
    })
    return obj
  }
  private addUpdateEvents() {
    // Событие обновления записи (для сохранения в БД)
    this.events.push(UpdatePartnerEvent(this))
    //  Оповещение пользователей об обновлении записи
    this.events.push(
      NotifyClientsEvent({
        subscriber: this.company.toString(),
        topic: PARTNER_DOMAIN_EVENTS.updated,
        payload: this,
      })
    )
  }

  addIdleTruckNotify(notify: IdleTruckNotify) {
    this.idleTruckNotifications.push(notify)
    this.addUpdateEvents()
  }

  updateIdleTruckNotify(notifyId: string, notify: IdleTruckNotify): void {
    const idx = this.idleTruckNotifications.findIndex(
      (i) => i._id?.toString() === notifyId
    )
    if (idx === -1)
      throw new Error(
        'PartnerDomain : updateIdleTruckNotify : notify not found'
      )

    this.idleTruckNotifications.splice(idx, 1, notify)

    this.addUpdateEvents()
  }

  deleteIdleTruckNotify(idleId: string) {
    this.idleTruckNotifications = this.idleTruckNotifications.filter(
      (i) => i._id?.toString() !== idleId
    )
    this.addUpdateEvents()
  }

  public static dbSchema() {
    return {
      name: String,
      fullName: String,
      inn: String,
      company: { type: Types.ObjectId, ref: 'Company' },
      contacts: String,
      group: { type: String, enum: [...PARTNER_GROUPS_ENUM_VALUES, null] },
      isClient: { type: Boolean, default: false },
      isService: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      placesForTransferDocs: [LoadingDock.dbSchema()],
      idleTruckNotifications: [IdleTruckNotify.dbSchema()],
    }
  }
}
