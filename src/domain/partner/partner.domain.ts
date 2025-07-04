import { Types } from 'mongoose'
import {
  PARTNER_GROUPS_ENUM_VALUES,
  PARTNER_GROUPS_ENUM,
} from '../../constants/partner'
import { LoadingDock } from './loadingDock.domain'
import { IdleTruckNotification } from './idleTruckNotification'
import { BusEvent } from 'ts-bus/types'

import {
  PARTNER_DOMAIN_EVENTS,
  UpdatePartnerEvent,
  toCancelIdleTruckNotificationMessagesEvent,
} from './domainEvents'
import { NotifyClientsEvent } from '../../socket/notifyClientsEvent'
import {
  INotificationsByRouteRes,
  IParterProps,
  IPartnerWithIdProps,
} from './interfaces'

import * as utils from './helpers/index'
import { Order } from '../order/order.domain'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'

export class Partner {
  events: BusEvent<any>[] = []
  _id?: string
  name: string
  fullName?: string
  inn?: string
  company: string
  contacts?: string
  cargoDescription?: string
  group?: PARTNER_GROUPS_ENUM
  isClient?: boolean = false
  isService?: boolean = false
  isActive: boolean = true
  placesForTransferDocs: LoadingDock[] = []
  idleTruckNotifications: IdleTruckNotification[] = []
  invoiceLoader: string | null = null
  bankAccountInfo: BankAccountInfo | null = null
  companyInfo: CompanyInfo | null = null

  constructor(p: IPartnerWithIdProps | IParterProps) {
    if ('_id' in p) this._id = p._id.toString()
    this.company = p.company?.toString()
    this.name = p.name
    this.fullName = p.fullName
    this.inn = p.inn
    this.contacts = p.contacts
    this.group = p.group
    this.cargoDescription = p.cargoDescription ?? undefined
    this.isClient = p.isClient
    this.isService = p.isService
    this.companyInfo = p.companyInfo ? new CompanyInfo(p.companyInfo) : null
    this.bankAccountInfo = p.bankAccountInfo
      ? new BankAccountInfo(p.bankAccountInfo)
      : null
    this.isActive = p.isActive === undefined ? true : p.isActive
    this.placesForTransferDocs = utils.setLoadingDocs(p.placesForTransferDocs)
    this.idleTruckNotifications = utils.setIdleTruckNotifications(
      p.idleTruckNotifications
    )
    if (this.isClient && p.invoiceLoader) this.invoiceLoader = p.invoiceLoader
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

  notificationsByOrder(order: Order): INotificationsByRouteRes[] {
    const res: INotificationsByRouteRes[] = []
    if (
      !this.idleTruckNotifications ||
      this.idleTruckNotifications.length === 0
    )
      return []

    this.idleTruckNotifications
      .filter((i) => i.isActive)
      .forEach((notification) => {
        if (utils.isNeedCreateNotificationByOrder(notification, order)) {
          order.route.activePoints.forEach((point) => {
            if (utils.isNeedCreateNotificationByPoint(notification, point))
              res.push({ notification, point })
          })
        }
      })
    return res
  }

  addIdleTruckNotify(notify: IdleTruckNotification) {
    this.idleTruckNotifications.push(notify)
    this.addUpdateEvents()
  }

  updateIdleTruckNotify(notifyId: string, notify: IdleTruckNotification): void {
    const idx = this.idleTruckNotifications.findIndex(
      (i) => i._id?.toString() === notifyId
    )
    if (idx === -1)
      throw new Error(
        'PartnerDomain : updateIdleTruckNotify : notify not found'
      )

    this.idleTruckNotifications.splice(idx, 1, notify)
    if (notify.isActive === false)
      this.events.push(toCancelIdleTruckNotificationMessagesEvent(notifyId))
    this.addUpdateEvents()
  }

  deleteIdleTruckNotify(idleId: string) {
    this.idleTruckNotifications = this.idleTruckNotifications.filter(
      (i) => i._id?.toString() !== idleId
    )
    this.addUpdateEvents()
    this.events.push(toCancelIdleTruckNotificationMessagesEvent(idleId))
  }

  public static dbSchema() {
    return {
      name: { type: String, required: true },
      fullName: String,
      inn: String,
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      contacts: String,
      cargoDescription: String,
      group: { type: String, enum: [...PARTNER_GROUPS_ENUM_VALUES, null] },
      isClient: { type: Boolean, default: false },
      isService: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
      placesForTransferDocs: [LoadingDock.dbSchema()],
      idleTruckNotifications: [IdleTruckNotification.dbSchema()],
      invoiceLoader: { type: String },
      companyInfo: CompanyInfo.dbSchema,
      bankAccountInfo: BankAccountInfo.dbSchema,
    }
  }
}
