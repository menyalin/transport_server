// @ts-nocheck
import pkg from 'mongoose'

import { ORDER_ANALYTIC_TYPES_ENUM } from '../constants/order'
import { SALARY_TARIFF_TYPES_ENUM } from '../constants/accounting'
import { TARIFF_ROUND_BY_HOURS_ENUM } from '../constants/tariff'
import { PARTNER_GROUPS_ENUM } from '../constants/partner'
const { Schema, model, Types } = pkg

const schema = new Schema(
  {
    isActive: { type: Boolean, default: true },
    company: { type: Types.ObjectId, ref: 'Company', required: true },
    note: { type: String },
    date: { type: Date, required: true },
    type: { type: String, enum: SALARY_TARIFF_TYPES_ENUM },
    tks: [{ type: Types.ObjectId, ref: 'TkName' }],
    liftCapacity: [{ type: Number, required: true }],
    sum: Number,
    loading: { type: Types.ObjectId, ref: 'Address' },
    unloading: { type: Types.ObjectId, ref: 'Address' },
    loadingZone: { type: Types.ObjectId, ref: 'Zone' },
    unloadingZone: { type: Types.ObjectId, ref: 'Zone' },
    loadingRegion: { type: Types.ObjectId, ref: 'Region' },
    unloadingRegion: { type: Types.ObjectId, ref: 'Region' },

    orderType: { type: String, enum: ORDER_ANALYTIC_TYPES_ENUM },
    includeHours: { type: Number },
    roundByHours: { type: Number, enum: TARIFF_ROUND_BY_HOURS_ENUM }, // Кратность округления по часам
    tariffBy: { type: String, enum: ['hour', 'day'] },
    clients: [{ type: Types.ObjectId, ref: 'Partner' }],
    consigneeTypes: [{ type: String, enum: PARTNER_GROUPS_ENUM }],
    isPltReturn: { type: Boolean, default: false },

    includedPoints: { type: Number },
  },

  { timestamps: true }
)

export default model('SalaryTariff', schema, 'salaryTariffs')
