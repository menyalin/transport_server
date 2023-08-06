import pkg from 'mongoose'
const { Types } = pkg

import {
  TARIFF_TYPES_ENUM,
  TARIFF_TYPES_ENUM_VALUES,
  TARIFF_ROUND_BY_HOURS_ENUM,
} from '../../constants/tariff'
import {
  BasePointsTariff,
  IBasePointsTariffProps,
  BaseZonesTariff,
  IBaseZonesTariffProps,
  BaseDirectDistanceZonesTariff,
  IDirectDistanceZonesTariffProps,
  WaitingTariff,
  IWaitingTariffProps,
  ReturnTariff,
  IReturnTariffProps,
  AdditionalPointsTariff,
  IAdditionalPointsTariffProps,
} from './tariffTypes'

import { TRUCK_KINDS_ENUM_VALUES } from '../../constants/truck'
import { ORDER_ANALYTIC_TYPES_ENUM } from '../../constants/order'

export type UnionTariffType = | BasePointsTariff
| BaseZonesTariff
| BaseDirectDistanceZonesTariff
| WaitingTariff
| AdditionalPointsTariff
| ReturnTariff

export class Tariff {
  private constructor() {}
  static create(
    tariffDTO:
      | IBasePointsTariffProps
      | IBaseZonesTariffProps
      | IDirectDistanceZonesTariffProps
      | IWaitingTariffProps
      | IAdditionalPointsTariffProps
      | IReturnTariffProps
  ): UnionTariffType
     {
    switch (tariffDTO.type) {
      case TARIFF_TYPES_ENUM.points:
        return new BasePointsTariff(tariffDTO as IBasePointsTariffProps)

      case TARIFF_TYPES_ENUM.zones:
        return new BaseZonesTariff(tariffDTO as IBaseZonesTariffProps)

      case TARIFF_TYPES_ENUM.directDistanceZones:
        return new BaseDirectDistanceZonesTariff(
          tariffDTO as IDirectDistanceZonesTariffProps
        )

      case TARIFF_TYPES_ENUM.waiting:
        return new WaitingTariff(tariffDTO as IWaitingTariffProps)

      case TARIFF_TYPES_ENUM.additionalPoints:
        return new AdditionalPointsTariff(
          tariffDTO as IAdditionalPointsTariffProps
        )

      case TARIFF_TYPES_ENUM.return:
        return new ReturnTariff(tariffDTO as IReturnTariffProps)

      default:
        throw new Error('unknow tariff type')
    }
  }

  static getDbSchema() {
    return {
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
      priceWOVat: { type: Number, required: false },
      sumVat: { type: Number, required: false },
      price: { type: Number, required: true },
      note: { type: String },
      document: { type: Types.ObjectId, ref: 'Document' },
      groupVat: { type: Boolean, required: true },
      withVat: { type: Boolean, required: true },
      agreement: { type: Types.ObjectId, ref: 'Agreement', required: true },
      agreementVatRate: { type: Number, required: true },
      // for 'points' type
      loading: { type: Types.ObjectId, ref: 'Address' },
      unloading: { type: Types.ObjectId, ref: 'Address' },
      // for 'additionalPoints' type
      orderType: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
      includedPoints: { type: Number },
      // for 'directDistanceZones' type, and "loading"
      zones: [
        {
          distance: Number,
          price: Number,
          priceWOVat: Number, // Удалить
          sumVat: Number, // Удалить
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
