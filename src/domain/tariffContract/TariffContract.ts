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

export class TariffContract {
  _id?: string
  agreement: string
  name: string
  company: string
  startDate: Date
  endDate: Date | null
  isActice: Boolean = true
  orderType: OrderType
  withVat: Boolean
  zonesTariffs: ZonesBaseTariff[]
  directDistanceZonesTariffs: DirectDistanceZonesBaseTariff[]
  additionalPointsTariffs: AdditionalPointsTariff[]
  returnPercentTariffs: ReturnPercentTariff[]
  idleTimeTariffs: IdleTimeTariff[]
  note?: string

  constructor(data: any) {
    const parsedData = TariffContract.validationSchema.parse(data)
    this._id = parsedData._id?.toString()
    this.agreement = parsedData.agreement
    this.name = parsedData.name
    this.startDate = parsedData.startDate
    this.endDate = parsedData.endDate
    this.isActice = parsedData.isActice
    this.orderType = parsedData.orderType
    this.withVat = parsedData.withVat
    this.company = parsedData.company.toString()
    this.zonesTariffs = parsedData.zonesTariffs.map(
      (i) => new ZonesBaseTariff(i)
    )
    this.directDistanceZonesTariffs = parsedData.directDistanceZonesTariffs.map(
      (i) => new DirectDistanceZonesBaseTariff(i)
    )
    this.additionalPointsTariffs = parsedData.additionalPointsTariffs.map(
      (i) => new AdditionalPointsTariff(i)
    )
    this.returnPercentTariffs = parsedData.returnPercentTariffs.map(
      (i) => new ReturnPercentTariff(i)
    )
    this.idleTimeTariffs = parsedData.idleTimeTariffs.map(
      (i) => new IdleTimeTariff(i)
    )
    this.note = parsedData.note
  }

  static validationSchema = z.object({
    _id: objectIdSchema.optional(),
    agreement: z.string(),
    name: z.string(),
    startDate: z.date(),
    company: objectIdSchema,
    endDate: z.date().nullable(),
    isActice: z.boolean().default(true),
    orderType: OrderTypeSchema,
    withVat: z.boolean(),
    zonesTariffs: z.array(ZonesBaseTariff.validationSchema),
    directDistanceZonesTariffs: z.array(
      DirectDistanceZonesBaseTariff.validationSchema
    ),
    additionalPointsTariffs: z.array(AdditionalPointsTariff.validationSchema),
    returnPercentTariffs: z.array(ReturnPercentTariff.validationSchema),
    idleTimeTariffs: z.array(IdleTimeTariff.validationSchema),
    note: z.string().optional(),
  })

  static get dbSchema() {
    return {
      company: { type: Types.ObjectId, ref: 'Company' },
      agreement: { type: Types.ObjectId, ref: 'Agreement' },
      name: { type: String, required: true },
      startDate: { type: Date, required: true },
      endDate: { type: Date, default: null },
      isActice: { type: Boolean, default: true },
      orderType: { type: String, required: true, enum: ['region', 'city'] },
      withVat: Boolean,
      zonesTariffs: [ZonesBaseTariff.dbSchema],
      directDistanceZonesTariffs: [DirectDistanceZonesBaseTariff.dbSchema],
      additionalPointsTariffs: [AdditionalPointsTariff.dbSchema],
      returnPercentTariffs: [ReturnPercentTariff.dbSchema],
      idleTimeTariffs: [IdleTimeTariff.dbSchema],
      note: String,
    }
  }
}
