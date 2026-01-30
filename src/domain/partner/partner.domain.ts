import { z } from 'zod'
import { Types } from 'mongoose'
import {
  PARTNER_GROUPS_ENUM_VALUES,
  PARTNER_GROUPS_ENUM,
} from '../../constants/partner'
import { LoadingDock } from './loadingDock.domain'
import { IdleTruckNotification } from './idleTruckNotification'
import { BusEvent } from 'ts-bus/types'
import { objectIdSchema } from '@/shared/validationSchemes'

import {
  PARTNER_DOMAIN_EVENTS,
  UpdatePartnerEvent,
  toCancelIdleTruckNotificationMessagesEvent,
} from './domainEvents'
import { NotifyClientsEvent } from '../../socket/notifyClientsEvent'
import { INotificationsByRouteRes } from './interfaces'

import * as utils from './helpers/index'
import { Order } from '../order/order.domain'
import { BankAccountInfo } from '../bankAccountInfo'
import { CompanyInfo } from '../companyInfo'
import { AllowedAgreement } from '../allowedAgreement'

export class Partner {
  events: BusEvent<any>[] = []
  _id?: string
  name: string
  fullName?: string | null
  inn?: string | null
  company: string
  contacts?: string | null
  agreements: AllowedAgreement[]
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

  constructor(props: unknown) {
    const p = Partner.validationSchema.parse(props)
    this._id = p._id?.toString()
    this.company = p.company?.toString()
    this.name = p.name
    this.fullName = p.fullName
    this.agreements = p.agreements ?? []
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

  allowedAgreementsOnDate(date: Date): string[] {
    if (!this.agreements || this.agreements.length === 0) return []

    return this.agreements
      .filter((i) => {
        const dateMs = date.getTime()
        const startDateMs = i.startDate.getTime()

        // Дата должна быть не раньше startDate
        if (dateMs < startDateMs) return false

        // Если endDate указан, дата должна быть не позже endDate
        if (i.endDate) {
          const endDateMs = i.endDate.getTime()
          if (dateMs > endDateMs) return false
        }

        return true
      })
      .map((agreement) => agreement.agreement.toString())
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

  static get validationSchema() {
    const loadingDockSchema = z.object({
      _id: objectIdSchema.optional(),
      title: z.string(),
      address: objectIdSchema.transform((v) => v.toString()),
      allowedLoadingPoints: z.array(objectIdSchema).optional().nullable(),
      contacts: z.string().optional().nullable(),
      note: z.string().optional().nullable(),
      resctrictAddresses: z.boolean().optional().default(true),
    })

    const idleTruckNotificationSchema = z.object({
      _id: objectIdSchema.optional(),
      title: z.string(),
      agreement: objectIdSchema.optional().nullable(),
      addresses: z.array(objectIdSchema).optional().nullable(),
      emails: z.string(),
      ccEmails: z.string().optional().nullable(),
      bccEmails: z.string().optional().nullable(),
      templateName: z.string(),
      idleHoursBeforeNotify: z.number().optional().default(0),
      note: z.string().optional().nullable(),
      usePlannedDate: z.boolean().optional().default(false),
      isActive: z.boolean().optional().default(false),
    })

    return z.object({
      _id: objectIdSchema.optional(),
      name: z.string(),
      fullName: z.string().optional().nullable(),
      inn: z.string().optional().nullable(),
      company: objectIdSchema,
      contacts: z.string().optional().nullable(),
      cargoDescription: z.string().optional().nullable(),
      group: z
        .enum([...PARTNER_GROUPS_ENUM_VALUES, 'null' as any])
        .optional()
        .nullable(),
      isClient: z.boolean().optional().default(false),
      isService: z.boolean().optional().default(false),
      isActive: z.boolean().optional().default(true),
      invoiceLoader: z.string().optional().nullable(),
      companyInfo: CompanyInfo.validationSchema.optional().nullable(),
      bankAccountInfo: BankAccountInfo.validationSchema.optional().nullable(),
      agreements: z
        .array(AllowedAgreement.validationSchema)
        .default([])
        .transform((v) => (v ? v.map((i) => new AllowedAgreement(i)) : [])),
      placesForTransferDocs: z
        .array(loadingDockSchema)
        .default([])
        .transform((v) => v?.map((i: any) => new LoadingDock(i)) || []),
      idleTruckNotifications: z
        .array(idleTruckNotificationSchema)
        .default([])
        .transform(
          (v) => v?.map((i: any) => new IdleTruckNotification(i)) || []
        ),
    })
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
      agreements: [AllowedAgreement.dbSchema],
    }
  }
}
