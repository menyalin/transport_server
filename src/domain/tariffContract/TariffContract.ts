import z from 'zod'
import { Types } from 'mongoose'
import { OrderType } from './types/common'
import {
  AdditionalPointsTariff,
  DirectDistanceZonesBaseTariff,
  IdleTimeTariff,
  ReturnPercentTariff,
  ZonesBaseTariff,
} from './types/tarriffs'
import { OrderTypeSchema } from './types/validationSchemes'
import { objectIdSchema } from '@/utils/objectIdSchema'
import { BusEvent } from 'ts-bus/types'
import { TariffContractUpdatedEvent } from './events'
import { ConflictResourceError } from '@/helpers/errors'
import { isEqualArraysOfObjects } from '@/utils/isEqualArraysOfObjects'
import { isEqualDates } from '@/utils/isEqualDates'

export class TariffContract {
  _id?: string
  agreement: string
  name: string
  company: string
  startDate: Date
  endDate: Date | null
  isActive: Boolean = true
  orderType: OrderType
  withVat: Boolean
  zonesTariffs: ZonesBaseTariff[]
  directDistanceZonesTariffs: DirectDistanceZonesBaseTariff[]
  additionalPointsTariffs: AdditionalPointsTariff[]
  returnPercentTariffs: ReturnPercentTariff[]
  idleTimeTariffs: IdleTimeTariff[]
  note?: string | null
  events: BusEvent[] = []
  _version: number = 0

  constructor(data: any) {
    const parsedData = TariffContract.validationSchema.parse(data)
    this._id = parsedData._id?.toString()
    this.agreement = parsedData.agreement.toString()
    this.name = parsedData.name
    this.startDate = parsedData.startDate
    this.endDate = parsedData.endDate
    this.isActive = parsedData.isActive
    this.orderType = parsedData.orderType
    this.withVat = parsedData.withVat
    this.company = parsedData.company.toString()
    this.zonesTariffs = parsedData.zonesTariffs
    this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs
    this.additionalPointsTariffs = parsedData.additionalPointsTariffs
    this.returnPercentTariffs = parsedData.returnPercentTariffs
    this.idleTimeTariffs = parsedData.idleTimeTariffs
    this.note = parsedData.note
    this._version = parsedData._version
  }

  clearEvents() {
    this.events = []
  }

  delete() {
    this.isActive = false
    this.events.push(TariffContractUpdatedEvent(this))
  }

  update(body: any) {
    let updated = false
    if (this._version !== body._version)
      throw new ConflictResourceError(
        'Версия документа устарела! Обновление не возможно!'
      )

    const parsedData = TariffContract.validationSchema.parse({
      ...body,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
    })

    if (this.name !== parsedData.name) {
      this.name = parsedData.name
      updated = true
    }
    if (!isEqualDates(this.startDate, parsedData.startDate)) {
      this.startDate = parsedData.startDate
      updated = true
    }
    if (!isEqualDates(this.endDate, parsedData.endDate)) {
      this.endDate = parsedData.endDate
      updated = true
    }
    if (this.orderType !== parsedData.orderType) {
      this.orderType = parsedData.orderType
      updated = true
    }
    if (this.withVat !== parsedData.withVat) {
      this.withVat = parsedData.withVat
      updated = true
    }
    if (this.note !== parsedData.note) {
      this.note = parsedData.note
      updated = true
    }

    if (!isEqualArraysOfObjects(this.zonesTariffs, parsedData.zonesTariffs)) {
      this.zonesTariffs = parsedData.zonesTariffs
      updated = true
    }

    if (
      !isEqualArraysOfObjects(
        this.directDistanceZonesTariffs,
        parsedData.directDistanceZonesTariffs
      )
    ) {
      this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs
      updated = true
    }

    if (
      !isEqualArraysOfObjects(
        this.additionalPointsTariffs,
        parsedData.additionalPointsTariffs
      )
    ) {
      this.additionalPointsTariffs = parsedData.additionalPointsTariffs
      updated = true
    }
    if (
      !isEqualArraysOfObjects(
        this.returnPercentTariffs,
        parsedData.returnPercentTariffs
      )
    ) {
      this.returnPercentTariffs = parsedData.returnPercentTariffs
      updated = true
    }

    if (
      !isEqualArraysOfObjects(this.idleTimeTariffs, parsedData.idleTimeTariffs)
    ) {
      this.idleTimeTariffs = parsedData.idleTimeTariffs
      updated = true
    }

    if (updated) {
      this._version += 1
      this.events.push(TariffContractUpdatedEvent(this))
    }
  }

  static validationSchema = z.object({
    _id: objectIdSchema.optional(),
    agreement: objectIdSchema,
    name: z.string(),
    startDate: z.date(),
    company: objectIdSchema,
    endDate: z.date().nullable(),
    isActive: z.boolean().default(true),
    orderType: OrderTypeSchema,
    withVat: z.boolean(),
    zonesTariffs: z
      .array(ZonesBaseTariff.validationSchema)
      .transform((arr) => arr.map((i) => new ZonesBaseTariff(i))),
    directDistanceZonesTariffs: z
      .array(DirectDistanceZonesBaseTariff.validationSchema)
      .transform((arr) => arr.map((i) => new DirectDistanceZonesBaseTariff(i))),

    additionalPointsTariffs: z
      .array(AdditionalPointsTariff.validationSchema)
      .transform((arr) => arr.map((i) => new AdditionalPointsTariff(i))),

    returnPercentTariffs: z
      .array(ReturnPercentTariff.validationSchema)
      .transform((arr) => arr.map((i) => new ReturnPercentTariff(i))),

    idleTimeTariffs: z
      .array(IdleTimeTariff.validationSchema)
      .transform((arr) => arr.map((i) => new IdleTimeTariff(i))),
    note: z.string().optional().nullable(),
    events: z.array(z.unknown()).optional(),
    _version: z.number().default(0),
  })

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company' },
      agreement: { type: Types.ObjectId, ref: 'Agreement' },
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
      orderType: { type: String, required: true, enum: ['region', 'city'] },
      withVat: Boolean,
      zonesTariffs: [ZonesBaseTariff.dbSchema],
      directDistanceZonesTariffs: [DirectDistanceZonesBaseTariff.dbSchema],
      additionalPointsTariffs: [AdditionalPointsTariff.dbSchema],
      returnPercentTariffs: [ReturnPercentTariff.dbSchema],
      idleTimeTariffs: [IdleTimeTariff.dbSchema],
      note: String,
      _version: { type: Number, default: 0 },
    }
  }
}