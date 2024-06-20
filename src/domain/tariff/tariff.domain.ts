import pkg from 'mongoose'
const { Types } = pkg

import {
  TARIFF_TYPES_ENUM,
  TARIFF_TYPES_ENUM_VALUES,
  TARIFF_ROUND_BY_HOURS_ENUM,
} from '../../constants/tariff'

import {
  TRUCK_KINDS_ENUM,
  TRUCK_KINDS_ENUM_VALUES,
} from '../../constants/truck'
import { ORDER_ANALYTIC_TYPES_ENUM } from '../../constants/order'
import { TariffPrice } from '../../values/tariff/tariffPrice'

export interface ITariffProps {
  _id?: string
  company: string
  date: Date
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  price?:
    | number
    | { price: number; withVat: boolean; currency?: string }
    | TariffPrice
  isActive?: boolean
  document?: string
  note?: string
  agreementName?: string

  // Удалить
  withVat?: boolean
  groupVat?: boolean
  priceWOVat?: number
  sumVat?: number
  group?: string
  groupNote?: string
  agreementVatRate?: number
}

export abstract class Tariff {
  abstract type: TARIFF_TYPES_ENUM
  _id?: string
  company: string
  date: Date
  agreement: string
  truckKind: TRUCK_KINDS_ENUM
  liftCapacity: number
  price: TariffPrice
  isActive?: boolean
  document?: string
  note?: string
  agreementName?: string

  constructor(p: ITariffProps) {
    this._id = p?._id?.toString()
    this.company = p.company
    this.date = p.date
    this.agreement = p.agreement
    this.truckKind = p.truckKind
    this.liftCapacity = p.liftCapacity
    this.isActive = p.isActive || true
    this.note = p.note
    this.document = p.document
    this.price = Tariff.setTariffPrice(p)
    this.agreementName = p.agreementName
  }

  private static setTariffPrice(p: ITariffProps): TariffPrice {
    if (
      p.groupVat !== undefined &&
      typeof p.price === 'number' &&
      typeof p.priceWOVat === 'number'
    )
      return new TariffPrice({
        price: p.groupVat ? p.price : p.priceWOVat,
        withVat: p.groupVat,
      })
    else if (typeof p.price === 'object' && !isNaN(p.price.price))
      return new TariffPrice(p.price)
    else {
      throw new Error('Tariff : setTariffPrice : invalid price!')
    }
  }

  static get dbSchema() {
    return {
      price: TariffPrice.dbSchema,
      company: { type: Types.ObjectId, ref: 'Company', required: true },
      date: { type: Date, required: true },
      type: { type: String, enum: TARIFF_TYPES_ENUM_VALUES },
      isActive: { type: Boolean, default: true },
      truckKind: {
        type: String,
        enum: TRUCK_KINDS_ENUM_VALUES,
        required: true,
      },
      liftCapacity: { type: Number, required: true },
      note: { type: String },
      document: { type: Types.ObjectId, ref: 'Document' },
      withVat: Boolean,
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      // for 'points' type
      loading: { type: Types.ObjectId, ref: 'Address' },
      unloading: { type: Types.ObjectId, ref: 'Address' },
      // for 'additionalPoints' type
      orderType: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
      includedPoints: { type: Number },
      zones: [
        {
          distance: Number,
          price: Number,
        },
      ],
      // for "waiting"
      includeHours: { type: Number },
      roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
      tariffBy: { type: String, enum: ['hour', 'day'] },
      // for 'return'
      percentOfTariff: { type: Number },
      loadingZone: { type: Types.ObjectId, ref: 'Zone' },
      unloadingZone: { type: Types.ObjectId, ref: 'Zone' },
    }
  }
}
